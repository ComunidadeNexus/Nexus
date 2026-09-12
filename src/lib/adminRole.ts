const ADMIN_CHECK_TIMEOUT_MS = 4500;
const CACHE_PREFIX = "nexus-admin-role:";

type AdminRoleCache = Record<string, boolean>;

const memoryCache: AdminRoleCache = {};
const inflight = new Map<string, Promise<boolean | null>>();

function cacheKey(userId: string) {
  return `${CACHE_PREFIX}${userId}`;
}

function readSessionCache(userId: string): boolean | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(cacheKey(userId));
    if (raw === "1") return true;
    if (raw === "0") return false;
  } catch {
    return null;
  }
  return null;
}

export function getCachedAdminRole(userId: string | null | undefined): boolean | null {
  if (!userId) return null;
  if (typeof memoryCache[userId] === "boolean") return memoryCache[userId];
  const stored = readSessionCache(userId);
  if (typeof stored === "boolean") {
    memoryCache[userId] = stored;
    return stored;
  }
  return null;
}

export function setCachedAdminRole(userId: string, isAdmin: boolean) {
  memoryCache[userId] = isAdmin;
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(cacheKey(userId), isAdmin ? "1" : "0");
  } catch {
    // Private mode / quota — memory cache is enough for this tab.
  }
}

export function clearAdminRoleCache(userId?: string) {
  if (userId) {
    delete memoryCache[userId];
    inflight.delete(userId);
    try {
      sessionStorage.removeItem(cacheKey(userId));
    } catch {
      /* ignore */
    }
    return;
  }

  for (const key of Object.keys(memoryCache)) delete memoryCache[key];
  inflight.clear();
  if (typeof sessionStorage === "undefined") return;
  try {
    const keys: string[] = [];
    for (let index = 0; index < sessionStorage.length; index += 1) {
      const key = sessionStorage.key(index);
      if (key?.startsWith(CACHE_PREFIX)) keys.push(key);
    }
    keys.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    /* ignore */
  }
}

function supabaseConfig() {
  return {
    url: (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "",
    apiKey: (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ?? "",
  };
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function rpcHasRole(
  userId: string,
  accessToken: string,
  signal: AbortSignal,
): Promise<boolean | null> {
  const { url, apiKey } = supabaseConfig();
  if (!url || !apiKey) return null;

  const response = await fetch(`${url}/rest/v1/rpc/has_role`, {
    method: "POST",
    signal,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ _user_id: userId, _role: "admin" }),
  });

  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) return null;
  const body = await parseJson(response);
  return typeof body === "boolean" ? body : null;
}

async function selectOwnAdminRole(
  userId: string,
  accessToken: string,
  signal: AbortSignal,
): Promise<boolean | null> {
  const { url, apiKey } = supabaseConfig();
  if (!url || !apiKey) return null;

  const params = new URLSearchParams({
    select: "role",
    user_id: `eq.${userId}`,
  });
  const response = await fetch(`${url}/rest/v1/user_roles?${params.toString()}`, {
    method: "GET",
    signal,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) return null;
  const body = await parseJson(response);
  if (!Array.isArray(body)) return null;
  return body.some(
    (row) => row && typeof row === "object" && (row as { role?: string }).role === "admin",
  );
}

async function refreshAccessToken(
  refreshToken: string,
  signal: AbortSignal,
): Promise<string | null> {
  const { url, apiKey } = supabaseConfig();
  if (!url || !apiKey) return null;

  const response = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    signal,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!response.ok) return null;
  const body = await parseJson(response);
  if (!body || typeof body !== "object") return null;
  const accessToken = (body as { access_token?: unknown }).access_token;
  return typeof accessToken === "string" ? accessToken : null;
}

async function resolveAdminRole(input: {
  userId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  signal?: AbortSignal;
}): Promise<boolean | null> {
  const cached = getCachedAdminRole(input.userId);
  let token = input.accessToken ?? "";
  const signal = input.signal ?? new AbortController().signal;

  const attempt = async (accessToken: string) => {
    const viaRpc = await rpcHasRole(input.userId, accessToken, signal);
    if (typeof viaRpc === "boolean") return viaRpc;
    return selectOwnAdminRole(input.userId, accessToken, signal);
  };

  if (token) {
    const first = await attempt(token);
    if (typeof first === "boolean") {
      setCachedAdminRole(input.userId, first);
      return first;
    }
  }

  if (input.refreshToken) {
    const refreshed = await refreshAccessToken(input.refreshToken, signal);
    if (refreshed) {
      token = refreshed;
      const second = await attempt(token);
      if (typeof second === "boolean") {
        setCachedAdminRole(input.userId, second);
        return second;
      }
    }
  }

  return cached;
}

/**
 * Role lookup that never uses supabase-js. Auth-js 2.90 can stall forever on
 * mobile behind navigator.locks; a raw REST/RPC call with AbortController
 * always settles, and the result is cached for later /admin mounts.
 */
export function fetchIsAdmin(input: {
  userId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  signal?: AbortSignal;
}): Promise<boolean | null> {
  const cached = getCachedAdminRole(input.userId);
  if (cached === true) return Promise.resolve(true);

  const existing = inflight.get(input.userId);
  if (existing) return existing;

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  input.signal?.addEventListener("abort", onAbort);

  const timeoutId = setTimeout(() => controller.abort(), ADMIN_CHECK_TIMEOUT_MS);
  const promise = resolveAdminRole({ ...input, signal: controller.signal })
    .catch((error) => {
      if (controller.signal.aborted) return getCachedAdminRole(input.userId);
      console.error("Error checking admin role:", error);
      return getCachedAdminRole(input.userId);
    })
    .finally(() => {
      clearTimeout(timeoutId);
      input.signal?.removeEventListener("abort", onAbort);
      inflight.delete(input.userId);
    });

  inflight.set(input.userId, promise);
  return promise;
}
