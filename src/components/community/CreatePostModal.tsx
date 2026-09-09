import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Type, Image as ImageIcon, Link as LinkIcon, BarChart2, Hash } from "lucide-react";
import { useNucleos } from "@/hooks/useNucleos";
import FileUpload from "@/components/upload/FileUpload";
import { useQueryClient } from "@tanstack/react-query";
import { useCategories } from "@/hooks/useCategories";
import { DynamicIcon } from "@/components/ui/DynamicIcon";

interface CreatePostModalProps {
  onPostCreated?: () => void;
  nucleoId?: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerNode?: React.ReactNode;
}

const CreatePostModal = ({
  onPostCreated,
  nucleoId,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  triggerNode,
}: CreatePostModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { myNucleos } = useNucleos();
  const { categories } = useCategories();
  const queryClient = useQueryClient();

  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;

  const handleOpenChange = (val: boolean) => {
    if (externalOnOpenChange) {
      externalOnOpenChange(val);
    } else {
      setInternalOpen(val);
    }
    if (!val) {
      setTimeout(resetForm, 300);
    }
  };

  const [activeTab, setActiveTab] = useState("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | "file" | null>(null);
  const [selectedNucleo, setSelectedNucleo] = useState<string | null>(nucleoId || null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setLinkUrl("");
    setMediaUrl(null);
    setMediaType(null);
    setSelectedNucleo(nucleoId || null);
    setSelectedCategory(null);
    setActiveTab("text");
  };

  const handleClose = () => {
    handleOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um post.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "O título do post é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedCategory) {
      toast({
        title: "Atenção",
        description: "Você deve selecionar um assunto (categoria) para postar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let finalContent = content.trim();
      const finalMediaUrl = mediaUrl;
      const finalMediaType = mediaType;

      if (activeTab === "link" && linkUrl.trim()) {
        finalContent = `${finalContent}\n\n${linkUrl.trim()}`;
      }

      // Encontra o nome do nucleo selecionado para exibição
      const currentNucleo = myNucleos.find((n) => n.id === selectedNucleo);

      const optimisticId = `temp-${Date.now()}`;
      const newFeedPost = {
        id: optimisticId,
        title: title.trim(),
        content: finalContent,
        user_id: user.id,
        nucleo_id: selectedNucleo,
        category_id: selectedCategory,
        media_url: finalMediaUrl,
        media_type: finalMediaType,
        upvotes_count: 0,
        downvotes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        author: {
          name: user?.user_metadata?.name || user?.email?.split("@")[0] || "Usuário",
          username: null,
          avatar_url: null,
        },
        nucleo: selectedNucleo
          ? { slug: currentNucleo?.slug || "nucleo", name: currentNucleo?.name || "Núcleo" }
          : { slug: "geral", name: "Geral" },
        user_vote: null,
      };

      // Atualização otimista: insere no topo do feed
      queryClient.setQueriesData({ queryKey: ["feed-posts"] }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return [newFeedPost, ...old];
      });

      toast({
        title: "Sucesso!",
        description: "Seu post foi publicado.",
      });

      handleClose();
      if (onPostCreated) onPostCreated();

      // Executa a requisição real no background
      supabase
        .from("posts")
        .insert({
          title: title.trim(),
          content: finalContent,
          user_id: user.id,
          nucleo_id: selectedNucleo,
          category_id: selectedCategory,
          media_url: finalMediaUrl,
          media_type: finalMediaType,
        })
        .then(({ error }) => {
          if (error) {
            console.error("Error creating post:", error);
            toast({
              title: "Erro",
              description: "Houve um problema ao processar seu post no servidor.",
              variant: "destructive",
            });
            queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
          } else {
            queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
          }
        });
    } catch (error) {
      console.error("Error formatting post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Encontra o nome do nucleo selecionado para exibição
  const currentNucleo = myNucleos.find((n) => n.id === selectedNucleo);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {triggerNode ? (
        <DialogTrigger asChild>{triggerNode}</DialogTrigger>
      ) : externalOpen === undefined ? (
        <DialogTrigger asChild>
          <Button variant="gradient" className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Post
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-[700px] max-h-[85dvh] overflow-y-auto p-0 bg-[#121212] border border-gray-800 text-white rounded-xl shadow-2xl [&>button]:hidden">
        {/* Header Customizado (Reddit style) */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-4 w-full">
            <h2 className="text-xl font-bold">Postar</h2>
            <div className="flex-1" />
            <button className="text-sm font-bold text-gray-400 hover:text-white transition-colors">
              Rascunhos
            </button>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[#2A2A2A] rounded-full transition-colors shrink-0"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-4 px-6">
          {/* Seletor de Comunidade */}
          <div className="mb-4 flex flex-wrap gap-2 min-w-0">
            <Select
              value={selectedNucleo || "none"}
              onValueChange={(value) => setSelectedNucleo(value === "none" ? null : value)}
            >
              <SelectTrigger className="w-full sm:w-[250px] bg-[#1A1A1A] border-gray-800 text-white font-bold h-11 rounded-full">
                <SelectValue placeholder="Selecionar comunidade">
                  {currentNucleo ? (
                    <div className="flex items-center gap-2">
                      {currentNucleo.avatar_url ? (
                        <img
                          src={currentNucleo.avatar_url}
                          alt=""
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center text-[10px] text-white">
                          n/
                        </div>
                      )}
                      n/{currentNucleo.slug}
                    </div>
                  ) : (
                    "Selecionar comunidade"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-gray-800 text-white">
                <SelectItem value="none">Seu Perfil (Sem comunidade)</SelectItem>
                {myNucleos.map((nucleo) => (
                  <SelectItem key={nucleo.id} value={nucleo.id}>
                    <div className="flex items-center gap-2 font-bold">
                      {nucleo.avatar_url ? (
                        <img
                          src={nucleo.avatar_url}
                          alt=""
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center text-[10px] text-white">
                          n/
                        </div>
                      )}
                      n/{nucleo.slug}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedCategory || "none"}
              onValueChange={(value) => setSelectedCategory(value === "none" ? null : value)}
            >
              <SelectTrigger className="w-full sm:w-[200px] bg-[#1A1A1A] border-gray-800 text-white font-bold h-11 rounded-full">
                <SelectValue placeholder="Assunto *" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-gray-800 text-white">
                <SelectItem value="none" disabled>
                  Selecione um assunto
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2 font-bold">
                      <div className="w-4 flex justify-center text-gray-400">
                        <DynamicIcon name={category.icon} size={14} />
                      </div>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full bg-transparent border-b border-gray-800 p-0 h-auto justify-start mb-4 rounded-none overflow-x-auto">
              <TabsTrigger
                value="text"
                className={`flex-1 rounded-none border-b-2 py-3 font-bold transition-all ${activeTab === "text" ? "border-[#00C6FF] text-[#00C6FF]" : "border-transparent text-gray-400 hover:bg-white/5"}`}
              >
                <Type className="w-4 h-4 mr-2" />
                Texto
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className={`flex-1 rounded-none border-b-2 py-3 font-bold transition-all ${activeTab === "media" ? "border-[#00C6FF] text-[#00C6FF]" : "border-transparent text-gray-400 hover:bg-white/5"}`}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Multimídia
              </TabsTrigger>
              <TabsTrigger
                value="link"
                className={`flex-1 rounded-none border-b-2 py-3 font-bold transition-all ${activeTab === "link" ? "border-[#00C6FF] text-[#00C6FF]" : "border-transparent text-gray-400 hover:bg-white/5"}`}
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Link
              </TabsTrigger>
              <TabsTrigger
                value="poll"
                disabled
                className="flex-1 rounded-none border-b-2 border-transparent py-3 font-bold text-gray-600 cursor-not-allowed"
              >
                <BarChart2 className="w-4 h-4 mr-2" />
                Enquete
              </TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              {/* Título (Comum a todas as abas) */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Título *"
                  value={title}
                  onChange={(e) => setTitle(e.target.value.substring(0, 300))}
                  className="w-full bg-transparent border border-gray-800 rounded-lg p-3 text-white font-bold placeholder:font-normal focus:outline-none focus:border-gray-500 transition-colors peer"
                />
                <div className="absolute right-3 bottom-3 text-xs text-gray-500 font-bold">
                  {title.length}/300
                </div>
              </div>

              {/* Botão de Tags (visual) */}
              <div>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2A2A2A] text-sm font-bold text-gray-400 hover:bg-[#3A3A3A] transition-colors">
                  <Hash className="w-4 h-4" />
                  Adicionar tags
                </button>
              </div>

              {/* Conteúdo Aba Texto */}
              <TabsContent value="text" className="mt-0">
                <div className="border border-gray-800 rounded-lg bg-transparent overflow-hidden focus-within:border-gray-500 transition-colors">
                  {/* Fake Toolbar */}
                  <div className="bg-[#1A1A1A] border-b border-gray-800 p-2 flex items-center gap-1 overflow-x-auto text-gray-400">
                    <button className="p-1.5 hover:bg-[#2A2A2A] rounded">
                      <b className="font-serif">B</b>
                    </button>
                    <button className="p-1.5 hover:bg-[#2A2A2A] rounded">
                      <i className="font-serif">i</i>
                    </button>
                    <button className="p-1.5 hover:bg-[#2A2A2A] rounded line-through">S</button>
                    <div className="w-px h-4 bg-gray-700 mx-2" />
                    <button className="p-1.5 hover:bg-[#2A2A2A] rounded">
                      <LinkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <Textarea
                    placeholder="Texto do post (opcional)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[150px] w-full bg-transparent border-none resize-none focus:outline-none focus-visible:ring-0 p-4"
                  />
                </div>
              </TabsContent>

              {/* Conteúdo Aba Multimídia */}
              <TabsContent value="media" className="mt-0">
                <div className="border border-dashed border-gray-700 rounded-xl p-8 bg-[#1A1A1A] hover:bg-[#2A2A2A] transition-colors">
                  <FileUpload
                    bucket="post-media"
                    onUpload={(url, type) => {
                      setMediaUrl(url);
                      setMediaType(type);
                    }}
                    accept="image/*,video/*"
                    maxSize={50} // 50MB for video/image
                    preview={true}
                    className="w-full"
                  />
                </div>
              </TabsContent>

              {/* Conteúdo Aba Link */}
              <TabsContent value="link" className="mt-0">
                <input
                  type="url"
                  placeholder="URL do link *"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full bg-transparent border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-gray-500 transition-colors"
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-gray-800 bg-[#121212] flex items-center justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            className="px-6 py-2 rounded-full font-bold text-gray-400 bg-transparent border border-gray-800 hover:bg-[#1A1A1A] transition-colors"
          >
            Salvar rascunho
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !selectedCategory}
            className="px-6 py-2 bg-[#2A2A2A] text-white rounded-full font-bold shadow-md disabled:opacity-50 transition-all hover:bg-gradient-to-r hover:from-[#00C6FF] hover:to-[#FF007F] disabled:hover:bg-[#2A2A2A]"
          >
            {isSubmitting ? "Publicando..." : "Postar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
