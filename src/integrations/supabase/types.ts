export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      badges: {
        Row: {
          color: string;
          created_at: string;
          description: string | null;
          icon: string;
          id: string;
          is_active: boolean;
          name: string;
          requirement_type: string;
          requirement_value: number;
          xp_reward: number;
        };
        Insert: {
          color?: string;
          created_at?: string;
          description?: string | null;
          icon: string;
          id?: string;
          is_active?: boolean;
          name: string;
          requirement_type: string;
          requirement_value?: number;
          xp_reward?: number;
        };
        Update: {
          color?: string;
          created_at?: string;
          description?: string | null;
          icon?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          requirement_type?: string;
          requirement_value?: number;
          xp_reward?: number;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          color: string;
          created_at: string;
          description: string | null;
          icon: string;
          id: string;
          is_active: boolean;
          is_admin_only: boolean;
          is_premium_only: boolean;
          name: string;
          order_position: number;
          parent_id: string | null;
          slug: string;
          updated_at: string;
        };
        Insert: {
          color?: string;
          created_at?: string;
          description?: string | null;
          icon?: string;
          id?: string;
          is_active?: boolean;
          is_admin_only?: boolean;
          is_premium_only?: boolean;
          name: string;
          order_position?: number;
          parent_id?: string | null;
          slug: string;
          updated_at?: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          description?: string | null;
          icon?: string;
          id?: string;
          is_active?: boolean;
          is_admin_only?: boolean;
          is_premium_only?: boolean;
          name?: string;
          order_position?: number;
          parent_id?: string | null;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_messages: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          is_deleted: boolean;
          media_type: string | null;
          media_url: string | null;
          reply_to_id: string | null;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          is_deleted?: boolean;
          media_type?: string | null;
          media_url?: string | null;
          reply_to_id?: string | null;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          is_deleted?: boolean;
          media_type?: string | null;
          media_url?: string | null;
          reply_to_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_reply_to_id_fkey";
            columns: ["reply_to_id"];
            isOneToOne: false;
            referencedRelation: "chat_messages";
            referencedColumns: ["id"];
          },
        ];
      };
      coin_packages: {
        Row: {
          bonus_coins: number;
          coins: number;
          created_at: string;
          currency: string;
          description: string | null;
          id: string;
          is_active: boolean;
          is_popular: boolean;
          name: string;
          price: number;
        };
        Insert: {
          bonus_coins?: number;
          coins: number;
          created_at?: string;
          currency?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          is_popular?: boolean;
          name: string;
          price: number;
        };
        Update: {
          bonus_coins?: number;
          coins?: number;
          created_at?: string;
          currency?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          is_popular?: boolean;
          name?: string;
          price?: number;
        };
        Relationships: [];
      };
      coin_transactions: {
        Row: {
          amount: number;
          created_at: string;
          description: string | null;
          id: string;
          reference_id: string | null;
          reference_type: string | null;
          type: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          reference_id?: string | null;
          reference_type?: string | null;
          type: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          reference_id?: string | null;
          reference_type?: string | null;
          type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          is_hidden: boolean;
          likes_count: number;
          parent_id: string | null;
          post_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          is_hidden?: boolean;
          likes_count?: number;
          parent_id?: string | null;
          post_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          is_hidden?: boolean;
          likes_count?: number;
          parent_id?: string | null;
          post_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          id: string;
          joined_at: string;
          last_read_at: string | null;
          user_id: string;
        };
        Insert: {
          conversation_id: string;
          id?: string;
          joined_at?: string;
          last_read_at?: string | null;
          user_id: string;
        };
        Update: {
          conversation_id?: string;
          id?: string;
          joined_at?: string;
          last_read_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          created_at: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      direct_messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          is_read: boolean;
          media_type: string | null;
          media_url: string | null;
          sender_id: string;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          media_type?: string | null;
          media_url?: string | null;
          sender_id: string;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          media_type?: string | null;
          media_url?: string | null;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "direct_messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
      followers: {
        Row: {
          created_at: string;
          follower_id: string;
          following_id: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          follower_id: string;
          following_id: string;
          id?: string;
        };
        Update: {
          created_at?: string;
          follower_id?: string;
          following_id?: string;
          id?: string;
        };
        Relationships: [];
      };
      marketplace_favorites: {
        Row: {
          created_at: string;
          id: string;
          listing_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          listing_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          listing_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "marketplace_favorites_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "marketplace_listings";
            referencedColumns: ["id"];
          },
        ];
      };
      marketplace_listings: {
        Row: {
          category: string;
          condition: string | null;
          created_at: string;
          currency: string;
          description: string;
          id: string;
          images: Json;
          is_negotiable: boolean;
          location: string | null;
          price: number;
          status: string;
          title: string;
          updated_at: string;
          user_id: string;
          views_count: number;
        };
        Insert: {
          category: string;
          condition?: string | null;
          created_at?: string;
          currency?: string;
          description: string;
          id?: string;
          images?: Json;
          is_negotiable?: boolean;
          location?: string | null;
          price: number;
          status?: string;
          title: string;
          updated_at?: string;
          user_id: string;
          views_count?: number;
        };
        Update: {
          category?: string;
          condition?: string | null;
          created_at?: string;
          currency?: string;
          description?: string;
          id?: string;
          images?: Json;
          is_negotiable?: boolean;
          location?: string | null;
          price?: number;
          status?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
          views_count?: number;
        };
        Relationships: [];
      };
      marketplace_messages: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          is_read: boolean;
          listing_id: string;
          receiver_id: string;
          sender_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          listing_id: string;
          receiver_id: string;
          sender_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          listing_id?: string;
          receiver_id?: string;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "marketplace_messages_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "marketplace_listings";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          actor_id: string | null;
          comment_id: string | null;
          created_at: string;
          id: string;
          is_read: boolean;
          message: string | null;
          post_id: string | null;
          title: string;
          type: Database["public"]["Enums"]["notification_type"];
          user_id: string;
        };
        Insert: {
          actor_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          message?: string | null;
          post_id?: string | null;
          title: string;
          type: Database["public"]["Enums"]["notification_type"];
          user_id: string;
        };
        Update: {
          actor_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          message?: string | null;
          post_id?: string | null;
          title?: string;
          type?: Database["public"]["Enums"]["notification_type"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_comment_id_fkey";
            columns: ["comment_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      nucleo_members: {
        Row: {
          id: string;
          joined_at: string;
          nucleo_id: string;
          role: Database["public"]["Enums"]["nucleo_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          joined_at?: string;
          nucleo_id: string;
          role?: Database["public"]["Enums"]["nucleo_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          joined_at?: string;
          nucleo_id?: string;
          role?: Database["public"]["Enums"]["nucleo_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "nucleo_members_nucleo_id_fkey";
            columns: ["nucleo_id"];
            isOneToOne: false;
            referencedRelation: "nucleos";
            referencedColumns: ["id"];
          },
        ];
      };
      nucleo_rules: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          nucleo_id: string;
          order_position: number;
          title: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          nucleo_id: string;
          order_position?: number;
          title: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          nucleo_id?: string;
          order_position?: number;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "nucleo_rules_nucleo_id_fkey";
            columns: ["nucleo_id"];
            isOneToOne: false;
            referencedRelation: "nucleos";
            referencedColumns: ["id"];
          },
        ];
      };
      nucleos: {
        Row: {
          avatar_url: string | null;
          banner_url: string | null;
          color: string;
          created_at: string;
          description: string | null;
          id: string;
          is_private: boolean;
          is_verified: boolean;
          members_count: number;
          name: string;
          owner_id: string;
          posts_count: number;
          slug: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          banner_url?: string | null;
          color?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_private?: boolean;
          is_verified?: boolean;
          members_count?: number;
          name: string;
          owner_id: string;
          posts_count?: number;
          slug: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          banner_url?: string | null;
          color?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_private?: boolean;
          is_verified?: boolean;
          members_count?: number;
          name?: string;
          owner_id?: string;
          posts_count?: number;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          created_at: string;
          description: string | null;
          features: Json;
          id: string;
          is_active: boolean;
          name: string;
          price_monthly: number;
          price_yearly: number;
          stripe_price_id_monthly: string | null;
          stripe_price_id_yearly: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          features?: Json;
          id?: string;
          is_active?: boolean;
          name: string;
          price_monthly?: number;
          price_yearly?: number;
          stripe_price_id_monthly?: string | null;
          stripe_price_id_yearly?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          features?: Json;
          id?: string;
          is_active?: boolean;
          name?: string;
          price_monthly?: number;
          price_yearly?: number;
          stripe_price_id_monthly?: string | null;
          stripe_price_id_yearly?: string | null;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          category_id: string | null;
          comments_count: number;
          content: string;
          created_at: string;
          downvotes: number;
          downvotes_count: number;
          id: string;
          is_hidden: boolean;
          is_pinned: boolean;
          is_premium_only: boolean;
          likes_count: number;
          media_type: string | null;
          media_url: string | null;
          nucleo_id: string | null;
          score: number;
          title: string | null;
          updated_at: string;
          upvotes: number;
          upvotes_count: number;
          user_id: string;
        };
        Insert: {
          category_id?: string | null;
          comments_count?: number;
          content: string;
          created_at?: string;
          downvotes?: number;
          downvotes_count?: number;
          id?: string;
          is_hidden?: boolean;
          is_pinned?: boolean;
          is_premium_only?: boolean;
          likes_count?: number;
          media_type?: string | null;
          media_url?: string | null;
          nucleo_id?: string | null;
          score?: number;
          title?: string | null;
          updated_at?: string;
          upvotes?: number;
          upvotes_count?: number;
          user_id: string;
        };
        Update: {
          category_id?: string | null;
          comments_count?: number;
          content?: string;
          created_at?: string;
          downvotes?: number;
          downvotes_count?: number;
          id?: string;
          is_hidden?: boolean;
          is_pinned?: boolean;
          is_premium_only?: boolean;
          likes_count?: number;
          media_type?: string | null;
          media_url?: string | null;
          nucleo_id?: string | null;
          score?: number;
          title?: string | null;
          updated_at?: string;
          upvotes?: number;
          upvotes_count?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_nucleo_id_fkey";
            columns: ["nucleo_id"];
            isOneToOne: false;
            referencedRelation: "nucleos";
            referencedColumns: ["id"];
          },
        ];
      };
      premium_items: {
        Row: {
          category: string;
          content_type: string;
          created_at: string;
          description: string | null;
          file_url: string;
          id: string;
          is_published: boolean;
          meta: string | null;
          sort_order: number;
          thumbnail_url: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          category?: string;
          content_type?: string;
          created_at?: string;
          description?: string | null;
          file_url: string;
          id?: string;
          is_published?: boolean;
          meta?: string | null;
          sort_order?: number;
          thumbnail_url?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          content_type?: string;
          created_at?: string;
          description?: string | null;
          file_url?: string;
          id?: string;
          is_published?: boolean;
          meta?: string | null;
          sort_order?: number;
          thumbnail_url?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          followers_count: number;
          following_count: number;
          id: string;
          is_banned: boolean;
          is_verified: boolean;
          karma: number;
          level: number;
          name: string | null;
          updated_at: string;
          user_id: string;
          username: string | null;
          xp_points: number;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          followers_count?: number;
          following_count?: number;
          id?: string;
          is_banned?: boolean;
          is_verified?: boolean;
          karma?: number;
          level?: number;
          name?: string | null;
          updated_at?: string;
          user_id: string;
          username?: string | null;
          xp_points?: number;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          followers_count?: number;
          following_count?: number;
          id?: string;
          is_banned?: boolean;
          is_verified?: boolean;
          karma?: number;
          level?: number;
          name?: string | null;
          updated_at?: string;
          user_id?: string;
          username?: string | null;
          xp_points?: number;
        };
        Relationships: [];
      };
      reactions: {
        Row: {
          comment_id: string | null;
          created_at: string;
          id: string;
          post_id: string | null;
          reaction_type: Database["public"]["Enums"]["reaction_type"];
          user_id: string;
        };
        Insert: {
          comment_id?: string | null;
          created_at?: string;
          id?: string;
          post_id?: string | null;
          reaction_type?: Database["public"]["Enums"]["reaction_type"];
          user_id: string;
        };
        Update: {
          comment_id?: string | null;
          created_at?: string;
          id?: string;
          post_id?: string | null;
          reaction_type?: Database["public"]["Enums"]["reaction_type"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reactions_comment_id_fkey";
            columns: ["comment_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reactions_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      stories: {
        Row: {
          caption: string | null;
          created_at: string;
          expires_at: string;
          id: string;
          is_active: boolean;
          media_type: string;
          media_url: string;
          user_id: string;
          views_count: number;
        };
        Insert: {
          caption?: string | null;
          created_at?: string;
          expires_at?: string;
          id?: string;
          is_active?: boolean;
          media_type: string;
          media_url: string;
          user_id: string;
          views_count?: number;
        };
        Update: {
          caption?: string | null;
          created_at?: string;
          expires_at?: string;
          id?: string;
          is_active?: boolean;
          media_type?: string;
          media_url?: string;
          user_id?: string;
          views_count?: number;
        };
        Relationships: [];
      };
      story_views: {
        Row: {
          id: string;
          story_id: string;
          user_id: string;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          user_id: string;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          user_id?: string;
          viewed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey";
            columns: ["story_id"];
            isOneToOne: false;
            referencedRelation: "stories";
            referencedColumns: ["id"];
          },
        ];
      };
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean;
          created_at: string;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          interval: Database["public"]["Enums"]["plan_interval"];
          plan_id: string;
          status: Database["public"]["Enums"]["subscription_status"];
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          interval?: Database["public"]["Enums"]["plan_interval"];
          plan_id: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cancel_at_period_end?: boolean;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          interval?: Database["public"]["Enums"]["plan_interval"];
          plan_id?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
        ];
      };
      user_badges: {
        Row: {
          badge_id: string;
          earned_at: string;
          id: string;
          user_id: string;
        };
        Insert: {
          badge_id: string;
          earned_at?: string;
          id?: string;
          user_id: string;
        };
        Update: {
          badge_id?: string;
          earned_at?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey";
            columns: ["badge_id"];
            isOneToOne: false;
            referencedRelation: "badges";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      user_wallets: {
        Row: {
          balance: number;
          created_at: string;
          id: string;
          total_earned: number;
          total_spent: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          balance?: number;
          created_at?: string;
          id?: string;
          total_earned?: number;
          total_spent?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          balance?: number;
          created_at?: string;
          id?: string;
          total_earned?: number;
          total_spent?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_ranking: {
        Args: { created_at: string; post_score: number };
        Returns: number;
      };
      create_conversation_with_participants: {
        Args: { p_other_user_id: string };
        Returns: string;
      };
      create_notification: {
        Args: {
          p_actor_id?: string;
          p_comment_id?: string;
          p_message?: string;
          p_post_id?: string;
          p_title: string;
          p_type: Database["public"]["Enums"]["notification_type"];
          p_user_id: string;
        };
        Returns: string;
      };
      admin_list_member_logins: {
        Args: { _user_ids: string[] };
        Returns: {
          email: string | null;
          last_sign_in_at: string | null;
          user_id: string;
        }[];
      };
      has_premium_access: { Args: { _user_id: string }; Returns: boolean };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_nucleo_member: {
        Args: { _nucleo_id: string; _user_id: string };
        Returns: boolean;
      };
      is_nucleo_moderator: {
        Args: { _nucleo_id: string; _user_id: string };
        Returns: boolean;
      };
      process_coin_transaction: {
        Args: {
          p_amount: number;
          p_description?: string;
          p_reference_id?: string;
          p_reference_type?: string;
          p_type: string;
          p_user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "user" | "premium" | "moderator" | "admin";
      notification_type:
        "like" | "comment" | "mention" | "follow" | "badge" | "level_up" | "system";
      nucleo_role: "owner" | "moderator" | "member";
      plan_interval: "monthly" | "yearly";
      reaction_type: "like" | "love" | "celebrate" | "insightful" | "curious";
      subscription_status: "active" | "canceled" | "past_due" | "trialing";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "premium", "moderator", "admin"],
      notification_type: ["like", "comment", "mention", "follow", "badge", "level_up", "system"],
      nucleo_role: ["owner", "moderator", "member"],
      plan_interval: ["monthly", "yearly"],
      reaction_type: ["like", "love", "celebrate", "insightful", "curious"],
      subscription_status: ["active", "canceled", "past_due", "trialing"],
    },
  },
} as const;
