import { useState, useEffect, useRef } from "react";
import { useGlobalChat } from "@/hooks/useGlobalChat";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, ImagePlus, X, Smile, SmilePlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import EmojiPicker from "emoji-picker-react";
import GifPicker from "@/components/feed/GifPicker";
import { renderMessageContent } from "@/utils/textParser";

const GlobalChat = () => {
  const { user } = useAuth();
  const { messages, isLoading, sendMessage, users } = useGlobalChat();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
    if (!newMessage.trim() && !mediaUrl) return;

    setIsSending(true);
    try {
      await sendMessage(newMessage.trim(), mediaUrl || undefined, mediaUrl ? "image" : undefined);
      setNewMessage("");
      setMediaUrl(null);
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
    } finally {
      setIsSending(false);
    }
  };

  const handleEmojiSelect = (emojiData: any) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const handleGifSelect = (gifUrl: string) => {
    const messageWithGif = newMessage ? `${newMessage} [GIF:${gifUrl}]` : `[GIF:${gifUrl}]`;
    sendMessage(messageWithGif, mediaUrl || undefined, mediaUrl ? "image" : undefined)
      .then(() => {
        setNewMessage("");
        setMediaUrl(null);
        setShowGifPicker(false);
      })
      .catch(() => toast.error("Erro ao enviar mensagem"));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("chat-media").getPublicUrl(fileName);

      setMediaUrl(urlData.publicUrl);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const getProfile = (userId: string) => {
    return users[userId];
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 flex flex-col">
      <main className="flex-1 container mx-auto px-4 pt-20 pb-4 max-w-3xl flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Chat Global</h1>
            <p className="text-sm text-muted-foreground">
              Converse com toda a comunidade em tempo real
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">{messages.length} mensagens</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 glass-card rounded-xl overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p>Nenhuma mensagem ainda.</p>
                <p className="text-sm">Seja o primeiro a enviar!</p>
              </div>
            ) : (
              messages.map((message) => {
                const profile = getProfile(message.user_id);
                const isOwn = message.user_id === user?.id;
                const initials =
                  profile?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "U";

                return (
                  <div key={message.id} className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs bg-primary/20">{initials}</AvatarFallback>
                    </Avatar>
                    <div className={cn("max-w-[70%] space-y-1", isOwn && "items-end")}>
                      <div className={cn("flex items-center gap-2", isOwn && "flex-row-reverse")}>
                        <span className="text-sm font-medium">{profile?.name || "Usuário"}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(message.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2",
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted rounded-bl-sm",
                        )}
                      >
                        {message.media_url && (
                          <img
                            src={message.media_url}
                            alt="Media"
                            className="max-w-full rounded-lg mb-2"
                          />
                        )}
                        {message.content && (
                          <div className="text-sm">{renderMessageContent(message.content)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Media Preview */}
          {mediaUrl && (
            <div className="px-4 py-2 border-t border-border">
              <div className="relative inline-block">
                <img src={mediaUrl} alt="Preview" className="h-20 rounded-lg object-cover" />
                <button
                  onClick={() => setMediaUrl(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <Button type="button" variant="ghost" size="icon" disabled={isUploading} asChild>
                  <span>
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <ImagePlus className="w-5 h-5" />
                    )}
                  </span>
                </Button>
              </label>

              <div className="flex-1 relative flex items-center">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="w-full pr-20"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
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
                onClick={handleSend}
                disabled={isSending || (!newMessage.trim() && !mediaUrl)}
                size="icon"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GlobalChat;
