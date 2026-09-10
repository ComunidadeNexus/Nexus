import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";

export function InstallAppModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isInstalled, canPrompt, platform, iosSafari, install } = usePwaInstall();

  if (isInstalled) return null;

  const handleInstallClick = async () => {
    const ok = await install();
    if (ok) setOpen(false);
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
            <span className="hidden sm:inline">Instalar app</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass-card border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Smartphone className="w-5 h-5" />
            Instalar o Nexus
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <p className="text-sm text-muted-foreground text-center">
            Coloque o Nexus na tela inicial. No Android é um toque; no iPhone é pelo Safari.
          </p>

          <div className="bg-black/20 border border-white/5 p-4 rounded-xl flex flex-col gap-3">
            {canPrompt ? (
              <Button
                onClick={handleInstallClick}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white gap-2"
              >
                <Download className="w-4 h-4" />
                Instalar agora
              </Button>
            ) : (
              <div className="text-sm space-y-3">
                {platform === "ios" && !iosSafari && (
                  <p className="text-yellow-400 font-medium">
                    Abra esta página no Safari para conseguir adicionar à tela inicial.
                  </p>
                )}
                {platform === "ios" ? (
                  <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                    <li>Toque em Compartilhar (quadrado com seta)</li>
                    <li>Adicionar à Tela de Início</li>
                    <li>Adicionar</li>
                  </ol>
                ) : (
                  <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                    <li>Menu do Chrome (três pontos)</li>
                    <li>Instalar app / Adicionar à tela inicial</li>
                  </ol>
                )}
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                navigate("/instalar");
              }}
            >
              Ver o passo a passo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
