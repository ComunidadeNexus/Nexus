import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bug, Send, Loader2 } from "lucide-react";
import { useFeedback } from "@/hooks/useFeedback";
import { useToast } from "@/components/ui/use-toast";

export function HelpModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitFeedback } = useFeedback();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    // Adiciona o prefixo [BUG] para que o painel admin saiba que é um erro
    const { error } = await submitFeedback(`[BUG] ${content}`);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Erro ao enviar reporte",
        description: error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Erro reportado com sucesso!",
      description: "Nossa equipe de suporte técnica vai analisar o caso em breve.",
    });

    setContent("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            className="gap-2 text-red-500 hover:text-red-400 hover:bg-red-500/10"
          >
            <Bug className="w-4 h-4" />
            <span className="hidden sm:inline">Reportar Erro</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass-card border-red-500/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-500">
            <Bug className="w-5 h-5" />
            Reportar Bug ou Erro
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Encontrou algum problema na plataforma? Descreva o que aconteceu para que possamos
            corrigir o mais rápido possível.
          </p>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ex: Tentei enviar uma mensagem no chat global, mas a tela ficou em branco..."
            className="min-h-[120px] bg-black/20 border-red-500/20 resize-none focus-visible:ring-red-500"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Enviar Reporte
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
