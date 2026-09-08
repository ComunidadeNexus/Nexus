import React, { useState } from "react";
import { MessageSquare, Trash2, Search, Image as ImageIcon } from "lucide-react";
import { useGlobalChat } from "@/hooks/useGlobalChat";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { renderMessageContent } from "@/utils/textParser";

const AdminChat = () => {
  const { messages, users, isLoading } = useGlobalChat();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja apagar esta mensagem do chat global?")) return;

    // Marcar como deletado para que suma para os usuários (soft delete)
    // ou deletar do banco. Como o useGlobalChat filtra por is_deleted = false, o soft delete funciona bem.
    const { error } = await supabase
      .from("chat_messages")
      .update({ is_deleted: true })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir mensagem", variant: "destructive" });
    } else {
      toast({ title: "Mensagem excluída com sucesso" });
    }
  };

  const filteredMessages = messages.filter((m) => {
    const user = users[m.user_id];
    const userName = user?.name || "Usuário Desconhecido";
    const contentMatch = m.content?.toLowerCase().includes(search.toLowerCase());
    const userMatch = userName.toLowerCase().includes(search.toLowerCase());
    return contentMatch || userMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Moderação de Chat</h1>
          <p className="text-sm text-muted-foreground">
            Monitore e exclua mensagens do Chat Global
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por mensagem ou usuário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Tabela de Mensagens */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-muted-foreground text-sm">
                <th className="p-4 font-medium">Usuário</th>
                <th className="p-4 font-medium">Mensagem</th>
                <th className="p-4 font-medium">Data</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="p-4">
                        <Skeleton className="h-10 w-32" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-64" />
                      </td>
                      <td className="p-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="p-4 text-right">
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </td>
                    </tr>
                  ))
              ) : filteredMessages.length > 0 ? (
                // Exibe as mais recentes primeiro no painel admin (reverse order)
                [...filteredMessages].reverse().map((msg) => {
                  const user = users[msg.user_id];
                  return (
                    <tr
                      key={msg.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {user?.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                              {user?.name?.charAt(0) || "U"}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-sm text-foreground">
                              {user?.name || "Usuário Desconhecido"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2 max-w-[400px]">
                          {msg.media_url && (
                            <div className="rounded-lg overflow-hidden border border-white/10 w-fit">
                              <img
                                src={msg.media_url}
                                alt="Mídia"
                                className="max-h-32 object-contain"
                              />
                            </div>
                          )}
                          {msg.content && (
                            <div className="text-sm text-gray-300 break-words">
                              {renderMessageContent(msg.content)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(msg.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(msg.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          title="Excluir mensagem"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    Nenhuma mensagem encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
