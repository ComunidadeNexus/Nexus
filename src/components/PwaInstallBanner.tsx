import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/usePwaInstall";

const STORAGE_KEY = "nexus-pwa-banner-dismissed";
const DISMISS_MS = 14 * 24 * 60 * 60 * 1000;

const wasDismissed = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < DISMISS_MS;
  } catch {
    return false;
  }
};

export const PwaInstallBanner = () => {
  const { isInstalled, canPrompt, platform } = usePwaInstall();
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (
      isInstalled ||
      location.pathname === "/instalar" ||
      location.pathname.startsWith("/chat") ||
      location.pathname.startsWith("/mensagens") ||
      location.pathname.startsWith("/ao-vivo") ||
      wasDismissed()
    ) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), 2500);
    return () => window.clearTimeout(timer);
  }, [isInstalled, location.pathname]);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  const cta =
    platform === "ios"
      ? "No iPhone: Safari → Compartilhar → Adicionar à Tela de Início"
      : canPrompt
        ? "Instale o Nexus e abra pela tela inicial, como um app."
        : "Adicione o Nexus à tela inicial do celular.";

  return (
    <div className="fixed z-40 left-3 right-3 md:left-auto md:right-6 md:w-[380px] bottom-[calc(9rem+env(safe-area-inset-bottom))] lg:bottom-24 lg:hidden">
      <div className="rounded-2xl border border-white/10 bg-[#0c121e]/95 backdrop-blur-xl shadow-2xl p-4 flex gap-3 items-start">
        <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0">
          <img src="/pwa-192x192.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Leve o Nexus no celular</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{cta}</p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              className="h-9 bg-gradient-to-r from-primary to-secondary text-white"
              onClick={() => {
                setVisible(false);
                navigate("/instalar");
              }}
            >
              {platform === "ios" ? <Share className="w-4 h-4 mr-1.5" /> : <Download className="w-4 h-4 mr-1.5" />}
              Instalar
            </Button>
            <Button size="sm" variant="ghost" className="h-9" onClick={dismiss}>
              Agora não
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 min-h-11 min-w-11 flex items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
