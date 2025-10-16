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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      campaign_activities: {
        Row: {
          activity_type: string
          campaign_id: string
          created_at: string
          id: string
          message: string
          metadata: Json | null
          priority: string
          title: string
          user_id: string
        }
        Insert: {
          activity_type: string
          campaign_id: string
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          priority?: string
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          campaign_id?: string
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          priority?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      campaign_participations: {
        Row: {
          campaign_id: string
          created_at: string
          creator_id: string
          current_likes: number | null
          current_views: number | null
          id: string
          initial_likes: number | null
          initial_views: number | null
          last_tracked_at: string | null
          payout_amount: number | null
          payout_claimed: boolean | null
          payout_claimed_at: string | null
          platform: string | null
          status: string | null
          updated_at: string
          video_id: string | null
          video_url: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string
          creator_id: string
          current_likes?: number | null
          current_views?: number | null
          id?: string
          initial_likes?: number | null
          initial_views?: number | null
          last_tracked_at?: string | null
          payout_amount?: number | null
          payout_claimed?: boolean | null
          payout_claimed_at?: string | null
          platform?: string | null
          status?: string | null
          updated_at?: string
          video_id?: string | null
          video_url?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string
          creator_id?: string
          current_likes?: number | null
          current_views?: number | null
          id?: string
          initial_likes?: number | null
          initial_views?: number | null
          last_tracked_at?: string | null
          payout_amount?: number | null
          payout_claimed?: boolean | null
          payout_claimed_at?: string | null
          platform?: string | null
          status?: string | null
          updated_at?: string
          video_id?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_participations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          approval_required: boolean | null
          artist_id: string
          budget: number
          campaign_mode: string | null
          campaign_type: string
          cover_art_url: string | null
          created_at: string
          end_date: string | null
          fixed_rate_description: string | null
          genre: string
          hybrid_reward_description: string | null
          id: string
          instructions: string | null
          max_payout: number | null
          payout_rate: number | null
          payout_type: string | null
          platforms: string[]
          reference_links: string | null
          rules: string | null
          song_title: string
          song_url: string | null
          status: string | null
          title: string
          updated_at: string
          vip_bonus: number | null
          vip_max_payout: number | null
        }
        Insert: {
          approval_required?: boolean | null
          artist_id: string
          budget: number
          campaign_mode?: string | null
          campaign_type: string
          cover_art_url?: string | null
          created_at?: string
          end_date?: string | null
          fixed_rate_description?: string | null
          genre: string
          hybrid_reward_description?: string | null
          id?: string
          instructions?: string | null
          max_payout?: number | null
          payout_rate?: number | null
          payout_type?: string | null
          platforms: string[]
          reference_links?: string | null
          rules?: string | null
          song_title: string
          song_url?: string | null
          status?: string | null
          title: string
          updated_at?: string
          vip_bonus?: number | null
          vip_max_payout?: number | null
        }
        Update: {
          approval_required?: boolean | null
          artist_id?: string
          budget?: number
          campaign_mode?: string | null
          campaign_type?: string
          cover_art_url?: string | null
          created_at?: string
          end_date?: string | null
          fixed_rate_description?: string | null
          genre?: string
          hybrid_reward_description?: string | null
          id?: string
          instructions?: string | null
          max_payout?: number | null
          payout_rate?: number | null
          payout_type?: string | null
          platforms?: string[]
          reference_links?: string | null
          rules?: string | null
          song_title?: string
          song_url?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          vip_bonus?: number | null
          vip_max_payout?: number | null
        }
        Relationships: []
      }
      chat_room_members: {
        Row: {
          id: string
          joined_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string | null
          room_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string | null
          room_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string | null
          room_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_creations: {
        Row: {
          campaign_id: string
          caption: string | null
          created_at: string | null
          creator_id: string
          id: string
          media_id: string | null
          platform: string | null
        }
        Insert: {
          campaign_id: string
          caption?: string | null
          created_at?: string | null
          creator_id: string
          id?: string
          media_id?: string | null
          platform?: string | null
        }
        Update: {
          campaign_id?: string
          caption?: string | null
          created_at?: string | null
          creator_id?: string
          id?: string
          media_id?: string | null
          platform?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_creations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_creations_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_creations_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_rewards: {
        Row: {
          campaign_id: string
          content_id: string | null
          created_at: string | null
          creator_id: string
          id: string
          reward_amount: number
          status: string | null
        }
        Insert: {
          campaign_id: string
          content_id?: string | null
          created_at?: string | null
          creator_id: string
          id?: string
          reward_amount: number
          status?: string | null
        }
        Update: {
          campaign_id?: string
          content_id?: string | null
          created_at?: string | null
          creator_id?: string
          id?: string
          reward_amount?: number
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_rewards_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_rewards_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_creations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_rewards_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_metrics: {
        Row: {
          collected_at: string | null
          comments: number | null
          content_id: string
          id: string
          likes: number | null
          shares: number | null
          views: number | null
        }
        Insert: {
          collected_at?: string | null
          comments?: number | null
          content_id: string
          id?: string
          likes?: number | null
          shares?: number | null
          views?: number | null
        }
        Update: {
          collected_at?: string | null
          comments?: number | null
          content_id?: string
          id?: string
          likes?: number | null
          shares?: number | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "engagement_metrics_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_creations"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          id: string
          type: string
          url: string
          user_id: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          type: string
          url: string
          user_id: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          type?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string
          room_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type?: string
          room_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          room_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          category: string
          created_at: string | null
          email_enabled: boolean | null
          id: string
          in_app_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          category: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          message: string
          metadata: Json | null
          priority: string | null
          read: boolean | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          priority?: string | null
          read?: boolean | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          priority?: string | null
          read?: boolean | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payout_requests: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          method: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          method: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          method?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          display_name: string | null
          engagement_score: number | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          membership_type: Database["public"]["Enums"]["membership_type"]
          paypal_account_status: string | null
          paypal_email: string | null
          portfolio_links: Json | null
          public_visibility: boolean | null
          stripe_account_id: string | null
          stripe_account_status: string | null
          updated_at: string
          user_id: string
          user_type: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          engagement_score?: number | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          membership_type?: Database["public"]["Enums"]["membership_type"]
          paypal_account_status?: string | null
          paypal_email?: string | null
          portfolio_links?: Json | null
          public_visibility?: boolean | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          updated_at?: string
          user_id: string
          user_type: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          engagement_score?: number | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          membership_type?: Database["public"]["Enums"]["membership_type"]
          paypal_account_status?: string | null
          paypal_email?: string | null
          portfolio_links?: Json | null
          public_visibility?: boolean | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string
          username?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string | null
          id: string
          message: string
          status: string | null
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          status?: string | null
          subject: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          status?: string | null
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          campaign_id: string | null
          created_at: string | null
          id: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          badge_description: string | null
          badge_name: string
          badge_type: string
          earned_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          badge_description?: string | null
          badge_name: string
          badge_type: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          badge_description?: string | null
          badge_name?: string
          badge_type?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_content_showcase: {
        Row: {
          content_type: string
          created_at: string
          description: string | null
          display_order: number | null
          featured: boolean | null
          id: string
          media_url: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          featured?: boolean | null
          id?: string
          media_url: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          featured?: boolean | null
          id?: string
          media_url?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_endorsements: {
        Row: {
          comment: string | null
          created_at: string
          endorsed_id: string
          endorser_id: string
          id: string
          rating: number
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          endorsed_id: string
          endorser_id: string
          id?: string
          rating: number
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          endorsed_id?: string
          endorser_id?: string
          id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_followers: {
        Row: {
          created_at: string
          followed_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string
          followed_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string
          followed_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: []
      }
      user_partnerships: {
        Row: {
          created_at: string
          id: string
          partner_id: string
          partnership_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          partner_id: string
          partnership_type?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          partner_id?: string
          partnership_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          created_at: string
          id: string
          skill_level: string
          skill_name: string
          user_id: string
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          skill_level?: string
          skill_name: string
          user_id: string
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          skill_level?: string
          skill_name?: string
          user_id?: string
          verified_by?: string | null
        }
        Relationships: []
      }
      view_tracking_logs: {
        Row: {
          id: string
          likes: number
          participation_id: string
          tracked_at: string
          views: number
        }
        Insert: {
          id?: string
          likes: number
          participation_id: string
          tracked_at?: string
          views: number
        }
        Update: {
          id?: string
          likes?: number
          participation_id?: string
          tracked_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "view_tracking_logs_participation_id_fkey"
            columns: ["participation_id"]
            isOneToOne: false
            referencedRelation: "campaign_participations"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number | null
          currency: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          currency?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          currency?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          display_name: string | null
          user_id: string | null
          user_type: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          display_name?: string | null
          user_id?: string | null
          user_type?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          display_name?: string | null
          user_id?: string | null
          user_type?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_user_chat_room_membership: {
        Args: { _room_id: string; _user_id: string }
        Returns: boolean
      }
      count_creators_by_type: {
        Args: Record<PropertyKey, never>
        Returns: {
          creator_count: number
          user_type: string
        }[]
      }
      create_notification: {
        Args: {
          p_category?: string
          p_message: string
          p_metadata?: Json
          p_priority?: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      get_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_chat_rooms: {
        Args: { _user_id: string }
        Returns: {
          room_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_campaign_artist: {
        Args: { _campaign_id: string; _user_id: string }
        Returns: boolean
      }
      is_campaign_participant: {
        Args: { _campaign_id: string; _user_id: string }
        Returns: boolean
      }
      sync_campaign_chat_members: {
        Args: { _campaign_id: string; _room_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "artist"
        | "creator"
        | "dj"
        | "producer"
        | "visual_creative"
        | "brand"
        | "record_label"
        | "music_group"
        | "collective"
        | "event_organizer"
      membership_type: "regular" | "premium"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: [
        "artist",
        "creator",
        "dj",
        "producer",
        "visual_creative",
        "brand",
        "record_label",
        "music_group",
        "collective",
        "event_organizer",
      ],
      membership_type: ["regular", "premium"],
    },
  },
} as const
