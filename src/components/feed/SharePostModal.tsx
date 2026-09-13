import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link2, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SharePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  title: string;
}

const SharePostModal = ({ isOpen, onClose, postId, title }: SharePostModalProps) => {
  const { conversations, isLoading } = useDirectMessages({
    enabled: isOpen,
    realtime: false,
  });
  const { user } = useAuth();
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const postUrl = `${window.location.origin}`; // No futuro, url especifica do post

  const handleSendToChat = async (conversationId: string) => {
    if (!user) return;
    setSendingTo(conversationId);

    try {
      const messageContent = `Confira este post: ${title}\n${postUrl}`;

      const { error } = await supabase.from("direct_messages").insert([
        {
          conversation_id: conversationId,
          sender_id: user.id,
          content: messageContent,
        },
      ]);

      if (error) throw error;

      // Update conversation's updated_at
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      toast.success("Enviado com sucesso!");
    } catch (err) {
      toast.error("Erro ao enviar mensagem.");
      console.error(err);
    } finally {
      setSendingTo(null);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${title} - ${postUrl}`);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Confira este post na Nexus: ${title} - ${postUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-[#1A282D] border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-center font-bold text-gray-900 dark:text-gray-100">
            Compartilhar
          </DialogTitle>
        </DialogHeader>

        {/* Lista de Contatos do Chat */}
        <div className="py-4">
          <h4 className="text-sm font-semibold text-gray-500 mb-3 px-1">Mensagens Privadas</h4>

          <div className="flex overflow-x-auto gap-4 pb-2 px-1 scrollbar-thin">
            {isLoading ? (
              <div className="text-sm text-gray-500 w-full text-center py-4">
                Carregando contatos...
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-sm text-gray-500 w-full text-center py-4">
                Nenhuma conversa recente.
              </div>
            ) : (
              conversations.map((conv) => {
                const otherParticipant = conv.participants.find((p) => p.user_id !== user?.id);
                if (!otherParticipant) return null;

                const isSending = sendingTo === conv.id;

                return (
                  <div
                    key={conv.id}
                    className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer"
                    onClick={() => !isSending && handleSendToChat(conv.id)}
                  >
                    <div className="relative">
                      <Avatar className="w-14 h-14 border border-gray-200 dark:border-gray-700">
                        <AvatarImage
                          src={otherParticipant.avatar_url || undefined}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {otherParticipant.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      {isSending && (
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-[1px]">
                          <Send className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate w-full text-center">
                      {otherParticipant.name?.split(" ")[0] || "Usuário"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Opções extras */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-[#2A3B42]/50 dark:hover:bg-[#2A3B42] transition-colors border border-gray-100 dark:border-gray-700/50"
          >
            <div className="w-10 h-10 rounded-full bg-white dark:bg-[#152024] flex items-center justify-center shadow-sm">
              <Link2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Copiar Link
            </span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="flex flex-col items-center justify-center gap-2 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-[#2A3B42]/50 dark:hover:bg-[#2A3B42] transition-colors border border-gray-100 dark:border-gray-700/50"
          >
            <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shadow-sm">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">WhatsApp</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharePostModal;
