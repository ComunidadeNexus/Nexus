import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants: {
    user_id: string;
    name: string | null;
    avatar_url: string | null;
  }[];
  lastMessage: DirectMessage | null;
  unreadCount: number;
}

interface ChatUser {
  name: string | null;
  avatar_url: string | null;
}

export const useDirectMessages = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!userId) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch conversations where user is a participant
      const { data: participationsData, error: participationsError } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId);

      if (participationsError) throw participationsError;

      const conversationIds = (participationsData || []).map((p) => p.conversation_id);

      if (conversationIds.length === 0) {
        setConversations([]);
        return;
      }

      // Fetch conversation details
      const { data: conversationsData, error: conversationsError } = await supabase
        .from("conversations")
        .select("*")
        .in("id", conversationIds)
        .order("updated_at", { ascending: false });

      if (conversationsError) throw conversationsError;

      // Fetch all participants for these conversations
      const { data: allParticipants } = await supabase
        .from("conversation_participants")
        .select("conversation_id, user_id")
        .in("conversation_id", conversationIds);

      // Get all user IDs
      const allUserIds = [...new Set((allParticipants || []).map((p) => p.user_id))];

      // Fetch profiles
      let profilesMap = new Map<
        string,
        { user_id: string; name: string | null; avatar_url: string | null }
      >();
      if (allUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, name, avatar_url")
          .in("user_id", allUserIds);
        profilesMap = new Map((profilesData || []).map((p) => [p.user_id, p]));
      }

      // Fetch last messages for each conversation
      const lastMessagesPromises = conversationIds.map((convId) =>
        supabase
          .from("direct_messages")
          .select("*")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),
      );

      const lastMessagesResults = await Promise.all(lastMessagesPromises);

      // Fetch unread counts
      const { data: unreadData } = await supabase
        .from("direct_messages")
        .select("conversation_id")
        .in("conversation_id", conversationIds)
        .eq("is_read", false)
        .neq("sender_id", userId);

      const unreadCountMap = new Map<string, number>();
      (unreadData || []).forEach((msg) => {
        const current = unreadCountMap.get(msg.conversation_id) || 0;
        unreadCountMap.set(msg.conversation_id, current + 1);
      });

      // Build conversations with all data
      const formattedConversations: Conversation[] = (conversationsData || []).map(
        (conv, index) => {
          const convParticipants = (allParticipants || [])
            .filter((p) => p.conversation_id === conv.id && p.user_id !== userId)
            .map((p) => {
              const profile = profilesMap.get(p.user_id);
              return {
                user_id: p.user_id,
                name: profile?.name || null,
                avatar_url: profile?.avatar_url || null,
              };
            });

          return {
            id: conv.id,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            participants: convParticipants,
            lastMessage: lastMessagesResults[index]?.data || null,
            unreadCount: unreadCountMap.get(conv.id) || 0,
          };
        },
      );

      setConversations(formattedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const startConversation = async (otherUserId: string) => {
    if (!user) return { error: "Not authenticated", conversationId: null };

    try {
      // Usar função RPC SECURITY DEFINER que contorna o RLS
      const { data, error } = await supabase.rpc("create_conversation_with_participants", {
        p_other_user_id: otherUserId,
      });

      if (error) throw error;

      await fetchConversations();
      return { error: null, conversationId: data };
    } catch (err: any) {
      console.error("Error starting conversation:", err);
      return { error: err.message, conversationId: null };
    }
  };

  const getTotalUnreadCount = () => {
    return conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  };

  useEffect(() => {
    fetchConversations();

    if (!userId) return;

    // Setup realtime subscription for new messages
    const channel = supabase
      .channel("dm-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
        },
        () => {
          fetchConversations();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchConversations]);

  return {
    conversations,
    isLoading,
    startConversation,
    getTotalUnreadCount,
    refetch: fetchConversations,
  };
};

export const useConversation = (conversationId: string | null) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [users, setUsers] = useState<Record<string, ChatUser>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!conversationId || !userId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const nextMessages = data || [];
      setMessages(nextMessages);
      setIsLoading(false);

      // Mark messages as read
      await supabase
        .from("direct_messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId)
        .eq("is_read", false);

      // Fetch user profiles
      const senderIds = [...new Set(nextMessages.map((m) => m.sender_id))];
      if (senderIds.length === 0) {
        return;
      }

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url")
        .in("user_id", senderIds);

      const usersMap: Record<string, ChatUser> = {};
      (profilesData || []).forEach((p) => {
        usersMap[p.user_id] = { name: p.name, avatar_url: p.avatar_url };
      });
      setUsers(usersMap);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setIsLoading(false);
    }
  }, [conversationId, userId]);

  const sendMessage = async (content: string, mediaUrl?: string, mediaType?: string) => {
    if (!user || !conversationId) return { error: "Not authenticated" };

    try {
      const { data, error } = await supabase
        .from("direct_messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          media_url: mediaUrl || null,
          media_type: mediaType || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation's updated_at
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      return { data, error: null };
    } catch (err: any) {
      console.error("Error sending message:", err);
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchMessages();

    if (!conversationId || !userId) return;

    // Setup realtime subscription
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as DirectMessage;

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });

          const { data } = await supabase
            .from("profiles")
            .select("user_id, name, avatar_url")
            .eq("user_id", newMessage.sender_id)
            .single();

          if (data) {
            setUsers((prev) => ({
              ...prev,
              [data.user_id]: { name: data.name, avatar_url: data.avatar_url },
            }));
          }

          // Mark as read if not sender
          if (newMessage.sender_id !== userId) {
            await supabase
              .from("direct_messages")
              .update({ is_read: true })
              .eq("id", newMessage.id);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId, fetchMessages]);

  return {
    messages,
    users,
    isLoading,
    sendMessage,
    refetch: fetchMessages,
  };
};
