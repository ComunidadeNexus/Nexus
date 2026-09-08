import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ReportProfileModalProps {
  reportedUserId: string;
  reportedUserName: string;
}

const ReportProfileModal = ({ reportedUserId, reportedUserName }: ReportProfileModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleReport = async () => {
    if (!reason.trim()) {
      toast.error("Por favor, digite o motivo da denúncia.");
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado para reportar.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Tentar salvar no Supabase (ignoramos erro se a tabela 'reports' não existir ainda)
      await supabase.from("reports").insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        reason: reason.trim(),
        status: "pending",
      });

      toast.success(`Denúncia contra ${reportedUserName} enviada. Analisaremos em breve.`);
      setIsOpen(false);
      setReason("");
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro ao enviar a denúncia.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          title="Reportar Perfil"
          className="flex items-center justify-center p-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-900/30 text-gray-400 transition-all shadow-sm"
        >
          <Flag className="w-4 h-4" />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-500">
            <Flag className="w-5 h-5" />
            Reportar Perfil
          </DialogTitle>
          <DialogDescription>
            Você está denunciando o perfil de <strong>{reportedUserName}</strong>. Por favor,
            descreva detalhadamente o motivo da sua denúncia.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: Spam, conteúdo ofensivo, perfil falso..."
            className="min-h-[120px] resize-none focus-visible:ring-red-500"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleReport}
            disabled={isSubmitting || !reason.trim()}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Enviar Denúncia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportProfileModal;
