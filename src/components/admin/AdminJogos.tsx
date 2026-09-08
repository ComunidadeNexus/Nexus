import React, { useState } from "react";
import { useGameDownloads } from "@/hooks/useGameDownloads";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, ExternalLink, Gamepad2, Plus } from "lucide-react";

const AdminJogos = () => {
  const { downloads, isLoading, addDownload, deleteDownload } = useGameDownloads();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    download_url: "",
    platform: "PC",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.download_url) return;

    setIsSubmitting(true);
    const success = await addDownload({
      title: formData.title,
      description: formData.description,
      image_url: formData.image_url,
      download_url: formData.download_url,
      platform: formData.platform,
    });

    if (success) {
      setFormData({ title: "", description: "", image_url: "", download_url: "", platform: "PC" });
      setShowForm(false);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight gradient-text">Downloads de Jogos</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie os jogos exclusivos disponíveis para download na comunidade.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" /> Novo Jogo
        </Button>
      </div>

      {showForm && (
        <Card className="border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <CardHeader>
            <CardTitle>Adicionar Novo Download</CardTitle>
            <CardDescription>
              Preencha os detalhes do jogo para disponibilizar no Hub.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título do Jogo *</Label>
                  <Input
                    required
                    placeholder="Ex: Minecraft (Mods Pack)"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plataforma</Label>
                  <Input
                    placeholder="Ex: PC, Android"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Link de Download *</Label>
                <Input
                  required
                  type="url"
                  placeholder="Ex: https://drive.google.com/..."
                  value={formData.download_url}
                  onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>URL da Imagem/Capa</Label>
                <Input
                  type="url"
                  placeholder="Link para a imagem do jogo"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Breve descrição ou instruções de instalação..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Publicar Jogo
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {downloads.length === 0 && !showForm ? (
            <div className="col-span-full flex flex-col items-center justify-center p-12 bg-muted/20 border border-dashed rounded-xl">
              <Gamepad2 className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center max-w-md">
                Nenhum jogo cadastrado. Os jogos que você adicionar aqui aparecerão no Hub de Games
                para a comunidade baixar.
              </p>
            </div>
          ) : (
            downloads.map((game) => (
              <Card
                key={game.id}
                className="overflow-hidden bg-card/50 border-white/5 hover:border-emerald-500/30 transition-colors"
              >
                <div
                  className="h-40 w-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${game.image_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000"})`,
                  }}
                />
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg leading-tight line-clamp-1">{game.title}</h3>
                    <span className="text-xs bg-secondary/20 text-secondary px-2 py-1 rounded-md">
                      {game.platform}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                    {game.description || "Nenhuma descrição informada."}
                  </p>

                  <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/10">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteDownload(game.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Remover
                    </Button>
                    <a
                      href={game.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" /> Testar
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminJogos;
