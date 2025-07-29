/**
 * Database Types
 * TypeScript interfaces for Supabase database schema
 * Based on ModelArk app requirements
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          subscription_tier: "free" | "premium" | "enterprise";
          credits_remaining: number;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: "free" | "premium" | "enterprise";
          credits_remaining?: number;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: "free" | "premium" | "enterprise";
          credits_remaining?: number;
        };
      };
      prompts: {
        Row: {
          id: string;
          user_id: string;
          prompt: string;
          created_at: string;
          updated_at: string;
          model_used: string;
          type: "image" | "video";
          size: string | null;
          guidance_scale: number | null;
          language: string;
          status?: "pending" | "processing" | "completed" | "failed";
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt: string;
          created_at?: string;
          updated_at?: string;
          model_used: string;
          type: "image" | "video";
          size?: string | null;
          guidance_scale?: number | null;
          language?: string;
          status?: "pending" | "processing" | "completed" | "failed";
        };
        Update: {
          id?: string;
          user_id?: string;
          prompt?: string;
          created_at?: string;
          updated_at?: string;
          model_used?: string;
          type?: "image" | "video";
          size?: string | null;
          guidance_scale?: number | null;
          language?: string;
          status?: "pending" | "processing" | "completed" | "failed";
        };
      };
      images: {
        Row: {
          id: string;
          prompt_id: string;
          url: string;
          created_at: string;
          updated_at: string;
          size: string;
          b64: string | null;
          file_size: number | null;
          mime_type: string | null;
        };
        Insert: {
          id?: string;
          prompt_id: string;
          url: string;
          created_at?: string;
          updated_at?: string;
          size: string;
          b64?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
        };
        Update: {
          id?: string;
          prompt_id?: string;
          url?: string;
          created_at?: string;
          updated_at?: string;
          size?: string;
          b64?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
        };
      };
      videos: {
        Row: {
          id: string;
          prompt_id: string;
          url: string | null;
          status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
          created_at: string;
          updated_at: string;
          duration: number | null;
          aspect_ratio: string | null;
          file_size: number | null;
          mime_type: string | null;
          task_id: string | null;
          error_message: string | null;
        };
        Insert: {
          id?: string;
          prompt_id: string;
          url?: string | null;
          status?: "queued" | "running" | "succeeded" | "failed" | "cancelled";
          created_at?: string;
          updated_at?: string;
          duration?: number | null;
          aspect_ratio?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          task_id?: string | null;
          error_message?: string | null;
        };
        Update: {
          id?: string;
          prompt_id?: string;
          url?: string | null;
          status?: "queued" | "running" | "succeeded" | "failed" | "cancelled";
          created_at?: string;
          updated_at?: string;
          duration?: number | null;
          aspect_ratio?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          task_id?: string | null;
          error_message?: string | null;
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
      subscription_tier: "free" | "premium" | "enterprise";
      prompt_type: "image" | "video";
      prompt_status: "pending" | "processing" | "completed" | "failed";
      video_status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
    };
  };
}

// Export individual table types for convenience
export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type Prompt = Database["public"]["Tables"]["prompts"]["Row"];
export type PromptInsert = Database["public"]["Tables"]["prompts"]["Insert"];
export type PromptUpdate = Database["public"]["Tables"]["prompts"]["Update"];

export type Image = Database["public"]["Tables"]["images"]["Row"];
export type ImageInsert = Database["public"]["Tables"]["images"]["Insert"];
export type ImageUpdate = Database["public"]["Tables"]["images"]["Update"];

export type Video = Database["public"]["Tables"]["videos"]["Row"];
export type VideoInsert = Database["public"]["Tables"]["videos"]["Insert"];
export type VideoUpdate = Database["public"]["Tables"]["videos"]["Update"]; 