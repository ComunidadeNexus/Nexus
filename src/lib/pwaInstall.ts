export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type PwaPlatform = "ios" | "android" | "desktop";

const listeners = new Set<() => void>();

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;

const isBrowser = typeof window !== "undefined";

export const detectPwaPlatform = (): PwaPlatform => {
  if (!isBrowser) return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
    return "ios";
  }
  if (/android/.test(ua)) return "android";
  return "desktop";
};

export const isIosSafari = () => {
  if (!isBrowser || detectPwaPlatform() !== "ios") return false;
  const ua = navigator.userAgent;
  return /Safari/i.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS|Instagram|FBAN|FBAV|Line\//i.test(ua);
};

export const isStandalonePwa = () => {
  if (!isBrowser) return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
};

const notify = () => {
  listeners.forEach((fn) => fn());
};

if (isBrowser) {
  installed = isStandalonePwa();

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installed = true;
    notify();
  });
}

export const getDeferredInstallPrompt = () => deferredPrompt;

export const consumeInstallPrompt = async () => {
  if (!deferredPrompt) return "dismissed" as const;
  const promptEvent = deferredPrompt;
  deferredPrompt = null;
  await promptEvent.prompt();
  const { outcome } = await promptEvent.userChoice;
  if (outcome === "accepted") installed = true;
  notify();
  return outcome;
};

export const subscribePwaInstall = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getPwaInstalled = () => installed;
