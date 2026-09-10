import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import {
  ArrowDown,
  CheckCircle2,
  Download,
  MoreVertical,
  Plus,
  Share,
  Smartphone,
  Monitor,
} from "lucide-react";
import { Link } from "react-router-dom";

const Step = ({ n, title, children }: { n: number; title: string; children: ReactNode }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
      {n}
    </div>
    <div className="space-y-2 min-w-0">
      <p className="font-medium text-foreground">{title}</p>
      {children}
    </div>
  </div>
);

const Install = () => {
  const { platform, isInstalled, canPrompt, iosSafari, install } = usePwaInstall();

  const handleInstall = async () => {
    await install();
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <img
              src="/pwa-192x192.png"
              alt="Nexus"
              className="w-24 h-24 mx-auto rounded-[1.75rem] shadow-lg shadow-primary/20"
            />
            <h1 className="text-3xl md:text-4xl font-bold gradient-text">Instale o Nexus</h1>
            <p className="text-muted-foreground text-lg">
              Ícone na tela inicial, abre em tela cheia — sem App Store por enquanto.
            </p>
          </div>

          {isInstalled ? (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Já está instalado</h3>
                    <p className="text-sm text-muted-foreground">
                      Abra pelo ícone do Nexus na tela inicial.
                    </p>
                    <Button asChild className="mt-3" size="sm">
                      <Link to="/comunidade">Ir para a comunidade</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {canPrompt && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardContent className="pt-6 text-center space-y-4">
                    <h3 className="font-semibold text-lg">Instalação em um toque</h3>
                    <p className="text-sm text-muted-foreground">
                      Seu navegador já pode instalar o Nexus como app.
                    </p>
                    <Button
                      size="lg"
                      onClick={handleInstall}
                      className="w-full md:w-auto bg-gradient-to-r from-primary to-secondary"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Instalar Nexus
                    </Button>
                  </CardContent>
                </Card>
              )}

              {platform === "ios" && !iosSafari && (
                <Card className="border-yellow-500/40 bg-yellow-500/5">
                  <CardContent className="pt-6 space-y-2">
                    <p className="font-semibold text-foreground">Abra no Safari</p>
                    <p className="text-sm text-muted-foreground">
                      No iPhone e iPad, a instalação só funciona pelo Safari. Se você está no Chrome,
                      Instagram ou outro app, toque em <strong>Compartilhar / Abrir no Safari</strong>{" "}
                      e depois volte nesta página.
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Por que instalar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "Ícone do Nexus na tela inicial",
                      "Abre em tela cheia, sem a barra do navegador",
                      "Atalho mais rápido para o feed e o chat",
                      "Funciona no Android e no iPhone",
                    ].map((benefit) => (
                      <li key={benefit} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {(platform === "ios" || platform === "android") && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      {platform === "ios" ? "iPhone e iPad" : "Android"}
                    </CardTitle>
                    <CardDescription>
                      {platform === "ios"
                        ? "Safari → Compartilhar → Adicionar à Tela de Início"
                        : canPrompt
                          ? "Se o botão acima não aparecer, use o menu do Chrome."
                          : "Chrome → menu → Instalar app"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {platform === "ios" ? (
                      <>
                        <Step n={1} title="Toque em Compartilhar">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <div className="p-2 rounded-lg bg-muted">
                              <Share className="w-5 h-5" />
                            </div>
                            <span>Ícone do quadrado com a seta, na barra do Safari</span>
                          </div>
                        </Step>
                        <div className="flex justify-center">
                          <ArrowDown className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <Step n={2} title='Toque em "Adicionar à Tela de Início"'>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <div className="p-2 rounded-lg bg-muted">
                              <Plus className="w-5 h-5" />
                            </div>
                            <span>Role a lista se não aparecer de primeira</span>
                          </div>
                        </Step>
                        <div className="flex justify-center">
                          <ArrowDown className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <Step n={3} title='Toque em "Adicionar"'>
                          <p className="text-sm text-muted-foreground">
                            O ícone do Nexus entra na tela inicial, como qualquer app.
                          </p>
                        </Step>
                      </>
                    ) : (
                      <>
                        <Step n={1} title="Abra o menu do Chrome">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <div className="p-2 rounded-lg bg-muted">
                              <MoreVertical className="w-5 h-5" />
                            </div>
                            <span>Três pontinhos no canto superior</span>
                          </div>
                        </Step>
                        <div className="flex justify-center">
                          <ArrowDown className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <Step n={2} title='Toque em "Instalar app"'>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <div className="p-2 rounded-lg bg-muted">
                              <Download className="w-5 h-5" />
                            </div>
                            <span>Pode aparecer como “Adicionar à tela inicial”</span>
                          </div>
                        </Step>
                        <div className="flex justify-center">
                          <ArrowDown className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <Step n={3} title="Confirme">
                          <p className="text-sm text-muted-foreground">
                            Pronto: o Nexus abre como app, pela tela inicial.
                          </p>
                        </Step>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {platform === "desktop" && !canPrompt && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="w-6 h-6" />
                      No computador
                    </CardTitle>
                    <CardDescription>Chrome, Edge ou outro navegador baseado em Chromium</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <Step n={1} title="Ícone de instalação na barra de endereço">
                      <p className="text-sm text-muted-foreground">
                        Fica no lado direito da URL. Se não aparecer, use o menu do navegador →
                        Instalar Nexus.
                      </p>
                    </Step>
                    <Step n={2} title="Confirme">
                      <p className="text-sm text-muted-foreground">
                        O Nexus abre em uma janela própria, sem as abas do navegador.
                      </p>
                    </Step>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Install;
