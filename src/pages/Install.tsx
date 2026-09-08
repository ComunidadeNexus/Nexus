import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  Share,
  MoreVertical,
  Plus,
  Smartphone,
  Monitor,
  CheckCircle2,
  ArrowDown,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "unknown">("unknown");

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform("ios");
    } else if (/android/.test(userAgent)) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <Smartphone className="w-12 h-12 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">Instale o Nexus</h1>
            <p className="text-muted-foreground text-lg">
              Tenha acesso rápido ao Nexus direto da sua tela inicial
            </p>
          </div>

          {/* Benefits */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Benefícios do App
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "Acesso rápido pela tela inicial",
                  "Experiência em tela cheia",
                  "Funciona offline",
                  "Notificações push",
                  "Carregamento mais rápido",
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Already Installed */}
          {isInstalled && (
            <Card className="glass-card border-primary/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">App já instalado!</h3>
                    <p className="text-sm text-muted-foreground">
                      O Nexus já está instalado no seu dispositivo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Install Button (for Android/Desktop with prompt available) */}
          {deferredPrompt && !isInstalled && (
            <Card className="glass-card border-primary/50">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="font-semibold text-lg text-foreground">Instalação Rápida</h3>
                  <Button
                    size="lg"
                    onClick={handleInstallClick}
                    className="w-full md:w-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Instalar Nexus
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* iOS Instructions */}
          {(platform === "ios" || platform === "unknown") && !isInstalled && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    🍎
                  </div>
                  Instalar no iPhone/iPad
                </CardTitle>
                <CardDescription>
                  Siga os passos abaixo para adicionar o Nexus à sua tela inicial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      1
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">Toque no botão Compartilhar</p>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <div className="p-2 rounded-lg bg-muted">
                          <Share className="w-5 h-5" />
                        </div>
                        <span>Na barra inferior do Safari</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <ArrowDown className="w-5 h-5 text-muted-foreground" />
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      2
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">
                        Role e toque em "Adicionar à Tela de Início"
                      </p>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <div className="p-2 rounded-lg bg-muted">
                          <Plus className="w-5 h-5" />
                        </div>
                        <span>Adicionar à Tela de Início</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <ArrowDown className="w-5 h-5 text-muted-foreground" />
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      3
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">Toque em "Adicionar"</p>
                      <p className="text-sm text-muted-foreground">
                        O ícone do Nexus aparecerá na sua tela inicial
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Android Instructions */}
          {(platform === "android" || platform === "unknown") &&
            !isInstalled &&
            !deferredPrompt && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      🤖
                    </div>
                    Instalar no Android
                  </CardTitle>
                  <CardDescription>
                    Siga os passos abaixo para adicionar o Nexus à sua tela inicial
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        1
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">Toque no menu do navegador</p>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <div className="p-2 rounded-lg bg-muted">
                            <MoreVertical className="w-5 h-5" />
                          </div>
                          <span>Os três pontos no canto superior</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <ArrowDown className="w-5 h-5 text-muted-foreground" />
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        2
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">
                          Toque em "Instalar app" ou "Adicionar à tela inicial"
                        </p>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <div className="p-2 rounded-lg bg-muted">
                            <Download className="w-5 h-5" />
                          </div>
                          <span>A opção pode variar conforme o navegador</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <ArrowDown className="w-5 h-5 text-muted-foreground" />
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        3
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-foreground">Confirme a instalação</p>
                        <p className="text-sm text-muted-foreground">
                          O ícone do Nexus aparecerá na sua tela inicial
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Desktop Instructions */}
          {platform === "desktop" && !isInstalled && !deferredPrompt && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-6 h-6" />
                  Instalar no Desktop
                </CardTitle>
                <CardDescription>
                  Instale o Nexus como um aplicativo no seu computador
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      1
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">Clique no ícone de instalação</p>
                      <p className="text-sm text-muted-foreground">
                        Procure pelo ícone de instalação na barra de endereço do navegador
                        (geralmente no canto direito)
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <ArrowDown className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      2
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-foreground">Confirme a instalação</p>
                      <p className="text-sm text-muted-foreground">
                        O Nexus será instalado como um aplicativo independente
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Install;
