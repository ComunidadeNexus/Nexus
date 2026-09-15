export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      badges: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string
          id: string
          is_active: boolean
          name: string
          requirement_type: string
          requirement_value: number
          xp_reward: number
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon: string
          id?: string
          is_active?: boolean
          name: string
          requirement_type: string
          requirement_value?: number
          xp_reward?: number
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          requirement_type?: string
          requirement_value?: number
          xp_reward?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string
          id: string
          is_active: boolean
          is_admin_only: boolean
          is_premium_only: boolean
          name: string
          order_position: number
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          is_admin_only?: boolean
          is_premium_only?: boolean
          name: string
          order_position?: number
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          is_admin_only?: boolean
          is_premium_only?: boolean
          name?: string
          order_position?: number
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_deleted: boolean
          media_type: string | null
          media_url: string | null
          reply_to_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          media_type?: string | null
          media_url?: string | null
          reply_to_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_deleted?: boolean
          media_type?: string | null
          media_url?: string | null
          reply_to_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      coin_packages: {
        Row: {
          bonus_coins: number
          coins: number
          created_at: string
          currency: string
          description: string | null
          id: string
          is_active: boolean
          is_popular: boolean
          name: string
          price: number
        }
        Insert: {
          bonus_coins?: number
          coins: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_popular?: boolean
          name: string
          price: number
        }
        Update: {
          bonus_coins?: number
          coins?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_popular?: boolean
          name?: string
          price?: number
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          is_hidden: boolean
          likes_count: number
          parent_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          likes_count?: number
          parent_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          likes_count?: number
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          media_type: string | null
          media_url: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          media_type?: string | null
          media_url?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          media_type?: string | null
          media_url?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      game_downloads: {
        Row: {
          created_at: string
          description: string | null
          download_url: string
          id: string
          image_url: string | null
          is_active: boolean | null
          platform: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          download_url: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          platform?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          download_url?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          platform?: string | null
          title?: string
        }
        Relationships: []
      }
      identity_verifications: {
        Row: {
          cpf_hash: string
          cpf_last4: string
          created_at: string
          id: string
          status: string
          user_id: string
          verified_at: string
        }
        Insert: {
          cpf_hash: string
          cpf_last4: string
          created_at?: string
          id?: string
          status: string
          user_id: string
          verified_at?: string
        }
        Update: {
          cpf_hash?: string
          cpf_last4?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
          verified_at?: string
        }
        Relationships: []
      }
      marketplace_favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          category: string
          condition: string | null
          created_at: string
          currency: string
          description: string
          id: string
          images: Json
          is_negotiable: boolean
          location: string | null
          price: number
          status: string
          title: string
          updated_at: string
          user_id: string
          views_count: number
        }
        Insert: {
          category: string
          condition?: string | null
          created_at?: string
          currency?: string
          description: string
          id?: string
          images?: Json
          is_negotiable?: boolean
          location?: string | null
          price: number
          status?: string
          title: string
          updated_at?: string
          user_id: string
          views_count?: number
        }
        Update: {
          category?: string
          condition?: string | null
          created_at?: string
          currency?: string
          description?: string
          id?: string
          images?: Json
          is_negotiable?: boolean
          location?: string | null
          price?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          views_count?: number
        }
        Relationships: []
      }
      marketplace_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          listing_id: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          listing_id: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          listing_id?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          comment_id: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          post_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          comment_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          post_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          actor_id?: string | null
          comment_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          post_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      nucleo_members: {
        Row: {
          id: string
          joined_at: string
          nucleo_id: string
          role: Database["public"]["Enums"]["nucleo_role"]
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          nucleo_id: string
          role?: Database["public"]["Enums"]["nucleo_role"]
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          nucleo_id?: string
          role?: Database["public"]["Enums"]["nucleo_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nucleo_members_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
        ]
      }
      nucleo_rules: {
        Row: {
          created_at: string
          description: string
          id: string
          nucleo_id: string
          order_position: number
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          nucleo_id: string
          order_position?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          nucleo_id?: string
          order_position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "nucleo_rules_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
        ]
      }
      nucleos: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          color: string
          created_at: string
          description: string | null
          id: string
          is_private: boolean
          is_verified: boolean
          members_count: number
          name: string
          owner_id: string
          posts_count: number
          slug: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean
          is_verified?: boolean
          members_count?: number
          name: string
          owner_id: string
          posts_count?: number
          slug: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          is_private?: boolean
          is_verified?: boolean
          members_count?: number
          name?: string
          owner_id?: string
          posts_count?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          buyer_email: string | null
          buyer_id: string
          checkout_url: string | null
          created_at: string
          currency: string
          id: string
          payment_provider: string
          payment_status: string
          plan_id: string | null
          product_id: string | null
          provider_offer_id: string | null
          provider_subscription_id: string | null
          provider_transaction_id: string | null
          seller_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          buyer_email?: string | null
          buyer_id: string
          checkout_url?: string | null
          created_at?: string
          currency?: string
          id?: string
          payment_provider?: string
          payment_status?: string
          plan_id?: string | null
          product_id?: string | null
          provider_offer_id?: string | null
          provider_subscription_id?: string | null
          provider_transaction_id?: string | null
          seller_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_email?: string | null
          buyer_id?: string
          checkout_url?: string | null
          created_at?: string
          currency?: string
          id?: string
          payment_provider?: string
          payment_status?: string
          plan_id?: string | null
          product_id?: string | null
          provider_offer_id?: string | null
          provider_subscription_id?: string | null
          provider_transaction_id?: string | null
          seller_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "producer_products"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_webhook_events: {
        Row: {
          created_at: string
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed: boolean
          processed_at: string | null
          provider: string
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          provider: string
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          provider?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          cakto_offer_id_monthly: string | null
          cakto_offer_id_yearly: string | null
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          name: string
          price_monthly: number
          price_yearly: number
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
        }
        Insert: {
          cakto_offer_id_monthly?: string | null
          cakto_offer_id_yearly?: string | null
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price_monthly?: number
          price_yearly?: number
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
        }
        Update: {
          cakto_offer_id_monthly?: string | null
          cakto_offer_id_yearly?: string | null
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price_monthly?: number
          price_yearly?: number
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          category_id: string | null
          comments_count: number
          content: string
          created_at: string
          downvotes: number
          downvotes_count: number
          id: string
          is_hidden: boolean
          is_pinned: boolean
          is_premium_only: boolean
          likes_count: number
          media_type: string | null
          media_url: string | null
          nucleo_id: string | null
          score: number
          title: string | null
          updated_at: string
          upvotes: number
          upvotes_count: number
          user_id: string
        }
        Insert: {
          category_id?: string | null
          comments_count?: number
          content: string
          created_at?: string
          downvotes?: number
          downvotes_count?: number
          id?: string
          is_hidden?: boolean
          is_pinned?: boolean
          is_premium_only?: boolean
          likes_count?: number
          media_type?: string | null
          media_url?: string | null
          nucleo_id?: string | null
          score?: number
          title?: string | null
          updated_at?: string
          upvotes?: number
          upvotes_count?: number
          user_id: string
        }
        Update: {
          category_id?: string | null
          comments_count?: number
          content?: string
          created_at?: string
          downvotes?: number
          downvotes_count?: number
          id?: string
          is_hidden?: boolean
          is_pinned?: boolean
          is_premium_only?: boolean
          likes_count?: number
          media_type?: string | null
          media_url?: string | null
          nucleo_id?: string | null
          score?: number
          title?: string | null
          updated_at?: string
          upvotes?: number
          upvotes_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_nucleo_id_fkey"
            columns: ["nucleo_id"]
            isOneToOne: false
            referencedRelation: "nucleos"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_items: {
        Row: {
          category: string
          content_type: string
          created_at: string
          description: string | null
          file_url: string
          id: string
          is_published: boolean
          meta: string | null
          sort_order: number
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content_type?: string
          created_at?: string
          description?: string | null
          file_url: string
          id?: string
          is_published?: boolean
          meta?: string | null
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content_type?: string
          created_at?: string
          description?: string | null
          file_url?: string
          id?: string
          is_published?: boolean
          meta?: string | null
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      producer_products: {
        Row: {
          cakto_offer_id: string | null
          cakto_product_id: string | null
          checkout_url: string | null
          created_at: string
          currency: string
          description: string
          id: string
          price: number
          producer_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          cakto_offer_id?: string | null
          cakto_product_id?: string | null
          checkout_url?: string | null
          created_at?: string
          currency?: string
          description?: string
          id?: string
          price: number
          producer_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          cakto_offer_id?: string | null
          cakto_product_id?: string | null
          checkout_url?: string | null
          created_at?: string
          currency?: string
          description?: string
          id?: string
          price?: number
          producer_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      producer_profiles: {
        Row: {
          address: string | null
          bank_data: Json
          birth_date: string | null
          business_name: string | null
          cakto_account_id: string | null
          cakto_account_status: string | null
          city: string | null
          created_at: string
          document_status: string
          email: string
          full_name: string
          id: string
          kyc_status: string
          phone: string | null
          pix_key: string | null
          postal_code: string | null
          producer_type: string
          review_notes: string | null
          state: string | null
          tax_id_hash: string
          tax_id_last4: string
          tax_id_type: string
          terms_accepted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          bank_data?: Json
          birth_date?: string | null
          business_name?: string | null
          cakto_account_id?: string | null
          cakto_account_status?: string | null
          city?: string | null
          created_at?: string
          document_status?: string
          email: string
          full_name: string
          id?: string
          kyc_status?: string
          phone?: string | null
          pix_key?: string | null
          postal_code?: string | null
          producer_type: string
          review_notes?: string | null
          state?: string | null
          tax_id_hash: string
          tax_id_last4: string
          tax_id_type: string
          terms_accepted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          bank_data?: Json
          birth_date?: string | null
          business_name?: string | null
          cakto_account_id?: string | null
          cakto_account_status?: string | null
          city?: string | null
          created_at?: string
          document_status?: string
          email?: string
          full_name?: string
          id?: string
          kyc_status?: string
          phone?: string | null
          pix_key?: string | null
          postal_code?: string | null
          producer_type?: string
          review_notes?: string | null
          state?: string | null
          tax_id_hash?: string
          tax_id_last4?: string
          tax_id_type?: string
          terms_accepted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      producer_transactions: {
        Row: {
          created_at: string
          gateway_fee: number
          gross_amount: number
          id: string
          order_id: string | null
          platform_fee: number
          producer_amount: number
          producer_id: string
          provider_transaction_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          gateway_fee?: number
          gross_amount?: number
          id?: string
          order_id?: string | null
          platform_fee?: number
          producer_amount?: number
          producer_id: string
          provider_transaction_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          gateway_fee?: number
          gross_amount?: number
          id?: string
          order_id?: string | null
          platform_fee?: number
          producer_amount?: number
          producer_id?: string
          provider_transaction_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "producer_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_entitlements: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_entitlements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_entitlements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "producer_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cakto_account_id: string | null
          cakto_account_status: string | null
          cakto_customer_id: string | null
          created_at: string
          followers_count: number
          following_count: number
          id: string
          is_banned: boolean
          is_producer: boolean
          is_verified: boolean
          karma: number
          level: number
          name: string | null
          producer_status: string
          profile_categories: string[]
          social_links: Json
          updated_at: string
          user_id: string
          username: string | null
          xp_points: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cakto_account_id?: string | null
          cakto_account_status?: string | null
          cakto_customer_id?: string | null
          created_at?: string
          followers_count?: number
          following_count?: number
          id?: string
          is_banned?: boolean
          is_producer?: boolean
          is_verified?: boolean
          karma?: number
          level?: number
          name?: string | null
          producer_status?: string
          profile_categories?: string[]
          social_links?: Json
          updated_at?: string
          user_id: string
          username?: string | null
          xp_points?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cakto_account_id?: string | null
          cakto_account_status?: string | null
          cakto_customer_id?: string | null
          created_at?: string
          followers_count?: number
          following_count?: number
          id?: string
          is_banned?: boolean
          is_producer?: boolean
          is_verified?: boolean
          karma?: number
          level?: number
          name?: string | null
          producer_status?: string
          profile_categories?: string[]
          social_links?: Json
          updated_at?: string
          user_id?: string
          username?: string | null
          xp_points?: number
        }
        Relationships: []
      }
      reactions: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          reaction_type: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          reaction_type?: Database["public"]["Enums"]["reaction_type"]
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          reaction_type?: Database["public"]["Enums"]["reaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          id: string
          reason: string
          reported_comment_id: string | null
          reported_post_id: string | null
          reported_user_id: string | null
          reporter_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          reason: string
          reported_comment_id?: string | null
          reported_post_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          reason?: string
          reported_comment_id?: string | null
          reported_post_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_comment_id_fkey"
            columns: ["reported_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_post_id_fkey"
            columns: ["reported_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      stories: {
        Row: {
          caption: string | null
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          media_type: string
          media_url: string
          user_id: string
          views_count: number
        }
        Insert: {
          caption?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          media_type: string
          media_url: string
          user_id: string
          views_count?: number
        }
        Update: {
          caption?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          media_type?: string
          media_url?: string
          user_id?: string
          views_count?: number
        }
        Relationships: []
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          story_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          interval: Database["public"]["Enums"]["plan_interval"]
          plan_id: string
          provider: string
          provider_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["plan_interval"]
          plan_id: string
          provider?: string
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["plan_interval"]
          plan_id?: string
          provider?: string
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_earned: number
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_credit_coins: {
        Args: { p_amount: number; p_description?: string; p_user_id: string }
        Returns: boolean
      }
      admin_list_member_logins: {
        Args: { _user_ids: string[] }
        Returns: {
          email: string
          last_sign_in_at: string
          user_id: string
        }[]
      }
      calculate_ranking: {
        Args: { created_at: string; post_score: number }
        Returns: number
      }
      create_conversation_with_participants: {
        Args: { p_other_user_id: string }
        Returns: string
      }
      create_notification: {
        Args: {
          p_actor_id?: string
          p_comment_id?: string
          p_message?: string
          p_post_id?: string
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_id: string
        }
        Returns: string
      }
      delete_own_nucleo: { Args: { p_nucleo_id: string }; Returns: boolean }
      has_premium_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved_producer: { Args: { _user_id: string }; Returns: boolean }
      is_nucleo_member: {
        Args: { _nucleo_id: string; _user_id: string }
        Returns: boolean
      }
      is_nucleo_moderator: {
        Args: { _nucleo_id: string; _user_id: string }
        Returns: boolean
      }
      is_username_available: { Args: { p_username: string }; Returns: boolean }
      leave_nucleo: { Args: { p_nucleo_id: string }; Returns: boolean }
      moderate_chat_message: {
        Args: { p_message_id: string }
        Returns: boolean
      }
      process_coin_transaction: {
        Args: {
          p_amount: number
          p_description?: string
          p_reference_id?: string
          p_reference_type?: string
          p_type: string
          p_user_id: string
        }
        Returns: boolean
      }
      profile_categories_are_valid: {
        Args: { cats: string[] }
        Returns: boolean
      }
      social_links_are_valid: { Args: { links: Json }; Returns: boolean }
      spend_own_coins: {
        Args: {
          p_amount: number
          p_description?: string
          p_reference_id?: string
          p_reference_type?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "premium" | "moderator" | "admin"
      notification_type:
        | "like"
        | "comment"
        | "mention"
        | "follow"
        | "badge"
        | "level_up"
        | "system"
        | "message"
      nucleo_role: "owner" | "moderator" | "member"
      plan_interval: "monthly" | "yearly"
      reaction_type:
        | "like"
        | "love"
        | "celebrate"
        | "insightful"
        | "curious"
        | "upvote"
        | "downvote"
      subscription_status: "active" | "canceled" | "past_due" | "trialing"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "premium", "moderator", "admin"],
      notification_type: [
        "like",
        "comment",
        "mention",
        "follow",
        "badge",
        "level_up",
        "system",
        "message",
      ],
      nucleo_role: ["owner", "moderator", "member"],
      plan_interval: ["monthly", "yearly"],
      reaction_type: [
        "like",
        "love",
        "celebrate",
        "insightful",
        "curious",
        "upvote",
        "downvote",
      ],
      subscription_status: ["active", "canceled", "past_due", "trialing"],
    },
  },
} as const

