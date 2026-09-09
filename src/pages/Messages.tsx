import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDirectMessages, useConversation } from "@/hooks/useDirectMessages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, ArrowLeft, MessageCircle, Smile, SmilePlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import EmojiPicker from "emoji-picker-react";
import GifPicker from "@/components/feed/GifPicker";
import { renderMessageContent } from "@/utils/textParser";

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, isLoading: conversationsLoading } = useDirectMessages();
  const {
    messages,
    users,
    isLoading: messagesLoading,
    sendMessage,
  } = useConversation(conversationId || null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    await sendMessage(newMessage.trim());
    setNewMessage("");
    setIsSending(false);
  };

  const handleEmojiSelect = (emojiData: any) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const handleGifSelect = async (gifUrl: string) => {
    const messageWithGif = newMessage ? `${newMessage} [GIF:${gifUrl}]` : `[GIF:${gifUrl}]`;
    setIsSending(true);
    await sendMessage(messageWithGif);
    setNewMessage("");
    setShowGifPicker(false);
    setIsSending(false);
  };

  const selectedConversation = conversations.find((c) => c.id === conversationId);

  return (
    <div className="w-full h-[calc(100vh-100px)] bg-white dark:bg-[#1A282D] rounded-xl border border-gray-200 dark:border-gray-800 flex overflow-hidden shadow-sm">
      {/* Conversations List */}
      <aside
        className={cn(
          "w-80 border-r border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#152024]/50",
          conversationId ? "hidden md:block" : "w-full md:w-80",
        )}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-bold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Mensagens
          </h2>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)] md:h-[calc(100vh-8rem)]">
          {conversationsLoading && conversations.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Nenhuma conversa ainda.</p>
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
                      conv.id === conversationId
                        ? "bg-white dark:bg-[#2A3B42] shadow-sm"
                        : "hover:bg-gray-100 dark:hover:bg-[#202E33]",
                    )}
                  >
                    <Avatar className="w-12 h-12 border border-gray-200 dark:border-gray-700">
                      <AvatarImage src={otherUser?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {otherUser?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate text-gray-900 dark:text-gray-100">
                        {otherUser?.name || "Usuário"}
                      </p>
                      {conv.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">{conv.lastMessage.content}</p>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-gradient-to-r from-[#00C6FF] to-[#FF007F] text-white text-xs rounded-full flex items-center justify-center font-bold">
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
      <main className={cn("flex-1 flex flex-col", !conversationId && "hidden md:flex")}>
        {conversationId ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 bg-white dark:bg-[#1A282D]">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-500"
                onClick={() => navigate("/mensagens")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Avatar className="w-10 h-10 border border-gray-200 dark:border-gray-700">
                <AvatarImage src={selectedConversation?.participants[0]?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {selectedConversation?.participants[0]?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                {selectedConversation?.participants[0]?.name || "Usuário"}
              </span>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-gray-50/30 dark:bg-[#0B1416]/30">
              {messagesLoading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isOwn = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] px-5 py-3 shadow-sm",
                            isOwn
                              ? "bg-gradient-to-br from-[#00C6FF] to-[#0072FF] text-white rounded-2xl rounded-tr-sm"
                              : "bg-white dark:bg-[#2A3B42] text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-gray-700",
                          )}
                        >
                          <div className="leading-relaxed">{renderMessageContent(msg.content)}</div>
                          <p
                            className={cn(
                              "text-[10px] mt-1 font-medium",
                              isOwn ? "text-white/70 text-right" : "text-gray-400 text-left",
                            )}
                          >
                            {formatDistanceToNow(new Date(msg.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1A282D] mb-16 md:mb-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-3"
              >
                <div className="flex-1 relative flex items-center">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escreva sua mensagem..."
                    className="w-full rounded-full px-6 pr-20 bg-gray-100 dark:bg-[#0B1416] border-none focus-visible:ring-1 focus-visible:ring-primary h-12"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmojiPicker(!showEmojiPicker);
                        setShowGifPicker(false);
                      }}
                      className="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-full transition-colors"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowGifPicker(!showGifPicker);
                        setShowEmojiPicker(false);
                      }}
                      className="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-full transition-colors"
                    >
                      <SmilePlus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Popovers */}
                  {showGifPicker && (
                    <GifPicker onSelect={handleGifSelect} onClose={() => setShowGifPicker(false)} />
                  )}
                  {showEmojiPicker && (
                    <div className="absolute bottom-full mb-2 right-0 z-50">
                      <EmojiPicker onEmojiClick={handleEmojiSelect} width={300} height={400} />
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isSending || !newMessage.trim()}
                  className="rounded-full w-12 h-12 p-0 flex items-center justify-center bg-gradient-to-r from-[#00C6FF] to-[#0072FF] hover:opacity-90 shadow-md transition-opacity"
                >
                  <Send className="w-5 h-5 ml-1" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium text-gray-500">Selecione uma conversa para começar</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Messages;
