import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  reply_to_id: string | null;
  is_deleted: boolean;
  created_at: string;
}

interface ChatUser {
  name: string | null;
  avatar_url: string | null;
}

export const useGlobalChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<Record<string, ChatUser>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("is_deleted", false)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      setMessages(data || []);

      // Fetch user profiles
      const userIds = [...new Set((data || []).map((m) => m.user_id))];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, name, avatar_url")
          .in("user_id", userIds);

        const usersMap: Record<string, ChatUser> = {};
        (profilesData || []).forEach((p) => {
          usersMap[p.user_id] = { name: p.name, avatar_url: p.avatar_url };
        });
        setUsers(usersMap);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (
    content: string,
    mediaUrl?: string,
    mediaType?: string,
    replyToId?: string,
  ) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          user_id: user.id,
          content,
          media_url: mediaUrl || null,
          media_type: mediaType || null,
          reply_to_id: replyToId || null,
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (err: any) {
      console.error("Error sending message:", err);
      return { error: err.message };
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("chat_messages")
        .update({ is_deleted: true })
        .eq("id", messageId)
        .eq("user_id", user.id);

      if (error) throw error;

      return { error: null };
    } catch (err: any) {
      console.error("Error deleting message:", err);
      return { error: err.message };
    }
  };

  // Setup realtime subscription
  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("global-chat-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;

          // Avoid duplicates
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });

          // Fetch user profile if not in cache
          const { data } = await supabase
            .from("profiles")
            .select("user_id, name, avatar_url")
            .eq("user_id", newMessage.user_id)
            .single();

          if (data) {
            setUsers((prev) => ({
              ...prev,
              [data.user_id]: { name: data.name, avatar_url: data.avatar_url },
            }));
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const updatedMessage = payload.new as ChatMessage;

          if (updatedMessage.is_deleted) {
            setMessages((prev) => prev.filter((m) => m.id !== updatedMessage.id));
          } else {
            setMessages((prev) =>
              prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    messages,
    users,
    isLoading,
    sendMessage,
    deleteMessage,
    refetch: fetchMessages,
  };
};
