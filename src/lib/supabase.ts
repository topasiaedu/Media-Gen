/**
 * Supabase Client Configuration
 * Initializes and exports the Supabase client for database operations
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

/**
 * Supabase client instance with TypeScript database types
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * Database table references for easy access
 */
export const db = {
  users: () => supabase.from("users"),
  prompts: () => supabase.from("prompts"),
  images: () => supabase.from("images"),
  videos: () => supabase.from("videos"),
} as const; 