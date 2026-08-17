import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDirectMessages, useConversation } from "@/hooks/useDirectMessages";
import Navbar from "@/components/Navbar";
import BottomNavigation from "@/components/BottomNavigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, ArrowLeft, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, isLoading: conversationsLoading } = useDirectMessages();
  const { messages, users, isLoading: messagesLoading, sendMessage } = useConversation(conversationId || null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    await sendMessage(newMessage.trim());
    setNewMessage("");
    setIsSending(false);
  };

  const selectedConversation = conversations.find(c => c.id === conversationId);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar />
      <div className="flex pt-16 h-[calc(100vh-4rem)] md:h-screen">
        {/* Conversations List */}
        <aside className={cn(
          "w-80 border-r border-border bg-card/30",
          conversationId ? "hidden md:block" : "w-full md:w-80"
        )}>
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Mensagens
            </h2>
          </div>
          <ScrollArea className="h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)]">
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma conversa ainda
              </p>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.map((conv) => {
                  const otherUser = conv.participants[0];
                  return (
                    <button
                      key={conv.id}
                      onClick={() => navigate(`/mensagens/${conv.id}`)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                        conv.id === conversationId ? "bg-primary/10" : "hover:bg-white/5"
                      )}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={otherUser?.avatar_url || undefined} />
                        <AvatarFallback>{otherUser?.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{otherUser?.name || "Usuário"}</p>
                        {conv.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </aside>

        {/* Chat Area */}
        <main className={cn(
          "flex-1 flex flex-col",
          !conversationId && "hidden md:flex"
        )}>
          {conversationId ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => navigate("/mensagens")}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={selectedConversation?.participants[0]?.avatar_url || undefined} />
                  <AvatarFallback>{selectedConversation?.participants[0]?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{selectedConversation?.participants[0]?.name || "Usuário"}</span>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isOwn = msg.sender_id === user?.id;
                      return (
                        <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                          <div className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-2",
                            isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                          )}>
                            <p>{msg.content}</p>
                            <p className={cn("text-xs mt-1", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-border mb-16 md:mb-0">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isSending || !newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Selecione uma conversa
            </div>
          )}
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Messages;
