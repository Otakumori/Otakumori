export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string | null;
          price: number;
          images: string[];
          variants: Json[];
          category: string;
          tags: string[];
          metadata: Json;
        };
        Insert: {
          id: string;
          created_at?: string;
          title: string;
          description?: string | null;
          price: number;
          images: string[];
          variants: Json[];
          category: string;
          tags: string[];
          metadata?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string | null;
          price?: number;
          images?: string[];
          variants?: Json[];
          category?: string;
          tags?: string[];
          metadata?: Json;
        };
      };
      users: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          username: string | null;
          avatar_url: string | null;
          petals_collected: number;
          level: number;
          experience: number;
          metadata: Json;
        };
        Insert: {
          id: string;
          created_at?: string;
          email: string;
          username?: string | null;
          avatar_url?: string | null;
          petals_collected?: number;
          level?: number;
          experience?: number;
          metadata?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          email?: string;
          username?: string | null;
          avatar_url?: string | null;
          petals_collected?: number;
          level?: number;
          experience?: number;
          metadata?: Json;
        };
      };
      achievements: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          type: string;
          metadata: Json;
        };
        Insert: {
          id: string;
          created_at?: string;
          user_id: string;
          type: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          type?: string;
          metadata?: Json;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
