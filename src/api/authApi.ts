/**
 * Authentication API
 * Handles authentication-related API calls and helper functions
 */

import { supabase } from "../lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Password reset request
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Update password (requires current session)
 */
export const updatePassword = async (newPassword: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Update user email (requires current session)
 */
export const updateEmail = async (newEmail: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Update user metadata
 */
export const updateUserMetadata = async (metadata: Record<string, any>): Promise<void> => {
  const { error } = await supabase.auth.updateUser({
    data: metadata,
  });

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Resend email confirmation
 */
export const resendEmailConfirmation = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email,
  });

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Get current user session
 */
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return session;
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<SupabaseUser | null> => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return user;
};

/**
 * Check if user email is verified
 */
export const isEmailVerified = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user?.email_confirmed_at !== null;
};

/**
 * Sign in with OAuth provider
 */
export const signInWithOAuth = async (provider: "google" | "github" | "discord"): Promise<void> => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Sign in with magic link
 */
export const signInWithMagicLink = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Verify OTP (One-Time Password)
 */
export const verifyOTP = async (
  email: string, 
  token: string, 
  type: "signup" | "recovery" | "email" = "signup"
): Promise<void> => {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type,
  });

  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Delete user account (requires current session)
 */
export const deleteAccount = async (): Promise<void> => {
  // Note: Supabase doesn't have a direct delete user method from client
  // This would typically be handled by a server-side function
  throw new Error("Account deletion must be handled server-side for security reasons");
};

/**
 * Check if a session is still valid
 */
export const isSessionValid = async (): Promise<boolean> => {
  try {
    const session = await getCurrentSession();
    return session !== null && new Date(session.expires_at! * 1000) > new Date();
  } catch {
    return false;
  }
};

/**
 * Refresh the current session
 */
export const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data.session;
};

/**
 * Get user profile data from user metadata
 */
export const getUserProfile = async () => {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || "",
    emailVerified: user.email_confirmed_at !== null,
    firstName: user.user_metadata?.first_name || "",
    lastName: user.user_metadata?.last_name || "",
    fullName: user.user_metadata?.full_name || "",
    avatar: user.user_metadata?.avatar_url || "",
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
};

/**
 * Authentication API object with all methods
 */
export const authApi = {
  requestPasswordReset,
  updatePassword,
  updateEmail,
  updateUserMetadata,
  resendEmailConfirmation,
  getCurrentSession,
  getCurrentUser,
  isEmailVerified,
  signInWithOAuth,
  signInWithMagicLink,
  verifyOTP,
  deleteAccount,
  isSessionValid,
  refreshSession,
  getUserProfile,
}; 