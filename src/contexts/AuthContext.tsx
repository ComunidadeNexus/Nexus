import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  clearClientSignedOut,
  clearForcedSignedOut,
  clearPersistedSupabaseAuth,
  isDurableSignedOut,
  markForcedSignedOut,
  noteSuccessfulSignIn,
  performHardSignOut,
  readStoredAuthSession,
  resolveForcedSignOutSession,
  sessionFromStored,
} from "@/lib/authStorage";
import { clearAdminRoleCache } from "@/lib/adminRole";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signingOut: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    username: string,
  ) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: "google" | "discord" | "github") => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readInitialSession(): Session | null {
  if (typeof window === "undefined") return null;
  if (isDurableSignedOut()) return null;
  const stored = readStoredAuthSession();
  return stored ? sessionFromStored(stored) : null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(readInitialSession);
  const [user, setUser] = useState<User | null>(() => readInitialSession()?.user ?? null);
  const [loading, setLoading] = useState(() => !readInitialSession()?.user);
  const [signingOut, setSigningOut] = useState(() => isDurableSignedOut());
  const sessionRef = useRef<Session | null>(session);
  const signingOutRef = useRef(signingOut);

  const beginSignedOut = () => {
    signingOutRef.current = true;
    markForcedSignedOut();
    clearAdminRoleCache(sessionRef.current?.user?.id);
    setSigningOut(true);
    sessionRef.current = null;
    setSession(null);
    setUser(null);
  };

  const endSignedOut = () => {
    signingOutRef.current = false;
    clearForcedSignedOut();
    setSigningOut(false);
  };

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    const applySession = (nextSession: Session | null, event: string | null = null) => {
      const forcedSignedOut = signingOutRef.current || isDurableSignedOut();
      const decision = resolveForcedSignOutSession({
        event,
        hasSession: Boolean(nextSession),
        forcedSignedOut,
      });

      if (decision === "accept-and-clear") {
        // Real password / OAuth SIGNED_IN — never treat this as JWT revival.
        endSignedOut();
        sessionRef.current = nextSession;
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setLoading(false);
        return;
      }

      if (decision === "reject-and-wipe") {
        // In-memory supabase session / late TOKEN_REFRESHED must not revive the user.
        clearPersistedSupabaseAuth();
        sessionRef.current = null;
        setSession(null);
        setUser(null);
        setSigningOut(true);
        setLoading(false);
        return;
      }

      if (nextSession) {
        // Leftover same-tab flag must not keep looking like Sair after a live session.
        clearClientSignedOut();
      }
      sessionRef.current = nextSession;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    };

    // Set up auth state listener BEFORE checking session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "SIGNED_IN" && nextSession) {
        applySession(nextSession, event);
        return;
      }
      if (signingOutRef.current || isDurableSignedOut()) {
        applySession(nextSession, event);
        return;
      }
      // Mobile token refresh can emit a transient null session. Do not wipe a
      // hydrated user or the /admin gate restarts and the spinner comes back.
      if (!nextSession && event !== "SIGNED_OUT" && sessionRef.current) {
        setLoading(false);
        return;
      }
      applySession(nextSession, event);
    });

    // Check for existing session — always clear loading, including reject/hang.
    // getSession / initialize() recovery is not SIGNED_IN; keep the Sair wipe.
    supabase.auth
      .getSession()
      .then(({ data: { session: nextSession } }) => {
        if (signingOutRef.current || isDurableSignedOut()) {
          applySession(nextSession, "INITIAL_SESSION");
          return;
        }
        if (!nextSession && sessionRef.current) {
          setLoading(false);
          return;
        }
        applySession(nextSession, "INITIAL_SESSION");
      })
      .catch((error) => {
        console.error("Error reading auth session:", error);
        setLoading(false);
      });

    const timeoutId = window.setTimeout(() => {
      setLoading(false);
    }, 4000);

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timeoutId);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      noteSuccessfulSignIn();
      endSignedOut();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, name: string, username: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            name,
            username,
          },
        },
      });
      if (error) throw error;
      noteSuccessfulSignIn();
      endSignedOut();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithOAuth = async (provider: "google" | "discord" | "github") => {
    try {
      const next = new URLSearchParams(window.location.search).get("next");
      const redirectTo = next
        ? `${window.location.origin}/auth?next=${encodeURIComponent(next)}`
        : `${window.location.origin}/auth`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      if (error) {
        const raw = error.message || "";
        if (/not enabled|unsupported provider|provider is not/i.test(raw)) {
          throw new Error(
            provider === "google"
              ? "Login com Google ainda não está ativado. Entre com email e senha."
              : "Este login social ainda não está disponível.",
          );
        }
        throw error;
      }
      if (!data.url) throw new Error("Não foi possível iniciar o login social.");

      // Neutralize before the IdP redirect so the return document does not
      // boot-wipe the PKCE verifier. SIGNED_IN on return still accepts the session.
      noteSuccessfulSignIn();
      endSignedOut();
      window.location.assign(data.url);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    beginSignedOut();
    // Never await supabase.auth.signOut() here. GoTrue global/local both take the
    // navigator lock (10s) and an in-flight TOKEN_REFRESHED can rewrite the JWT
    // after a storage wipe. Hard-redirect so the next document load cannot revive it.
    try {
      await supabase.auth.stopAutoRefresh();
    } catch {
      // ignore — wipe + replace is the guarantee
    }
    performHardSignOut();
  };

  useEffect(() => {
    console.log("AuthContext state updated:", { user: !!user, session: !!session, loading });
  }, [user, session, loading]);

  return (
    <AuthContext.Provider
      value={{
        user: signingOut && isDurableSignedOut() ? null : user,
        session: signingOut && isDurableSignedOut() ? null : session,
        loading: signingOut && isDurableSignedOut() ? false : loading,
        signingOut: signingOut && isDurableSignedOut(),
        signIn,
        signUp,
        signInWithOAuth,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
