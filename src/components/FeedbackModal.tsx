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
import { Lightbulb, Send, Loader2 } from "lucide-react";
import { useFeedback } from "@/hooks/useFeedback";
import { useToast } from "@/components/ui/use-toast";

export function FeedbackModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitFeedback } = useFeedback();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    const { error } = await submitFeedback(content);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Erro ao enviar dica",
        description: error,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Dica enviada!",
      description: "Muito obrigado por ajudar a melhorar a plataforma.",
    });

    setContent("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" className="gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span className="hidden sm:inline">Dar uma Dica</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass-card border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Tem alguma ideia?
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Sua opinião é fundamental. Conta pra gente o que podemos melhorar ou qual nova
            funcionalidade você gostaria de ver!
          </p>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ex: Seria legal ter uma forma de salvar os posts favoritos..."
            className="min-h-[120px] bg-black/20 border-white/10 resize-none"
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
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Enviar Dica
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
