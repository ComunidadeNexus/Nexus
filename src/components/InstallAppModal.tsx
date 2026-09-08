import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";

export function InstallAppModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstallable(false);
      setOpen(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            className="gap-2 text-primary hover:text-primary/80 hover:bg-primary/10"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Baixar App</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Smartphone className="w-5 h-5" />
            Baixar o Aplicativo Nexus
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            A plataforma Nexus foi 100% otimizada para funcionar perfeitamente no seu celular ou
            tablet!
          </p>

          <div className="bg-black/20 border border-white/5 p-4 rounded-xl flex flex-col gap-3">
            {isInstallable ? (
              <>
                <p className="text-sm font-medium text-center">
                  Seu navegador suporta instalação rápida. Clique no botão abaixo para adicionar à
                  sua tela inicial.
                </p>
                <Button
                  onClick={handleInstallClick}
                  className="w-full bg-primary text-white hover:bg-primary/90 gap-2"
                >
                  <Download className="w-4 h-4" />
                  Instalar Agora
                </Button>
              </>
            ) : (
              <div className="text-sm space-y-3">
                <p className="font-semibold text-center mb-2">Como instalar manualmente:</p>

                <div className="space-y-1">
                  <p className="font-medium text-primary">No iPhone / iPad (Safari):</p>
                  <ol className="list-decimal list-inside text-muted-foreground ml-2">
                    <li>
                      Toque no botão de <strong>Compartilhar</strong> (quadrado com seta para cima)
                    </li>
                    <li>
                      Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>
                    </li>
                  </ol>
                </div>

                <div className="space-y-1 mt-3">
                  <p className="font-medium text-primary">No Android (Chrome):</p>
                  <ol className="list-decimal list-inside text-muted-foreground ml-2">
                    <li>
                      Toque nos <strong>3 pontos</strong> no canto superior direito
                    </li>
                    <li>
                      Toque em <strong>"Adicionar à tela inicial"</strong> ou{" "}
                      <strong>"Instalar aplicativo"</strong>
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
