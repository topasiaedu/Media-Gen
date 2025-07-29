/**
 * Prompt Context
 * Dedicated context for Prompt table CRUD operations
 * Manages prompt creation, history, and status updates
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import type { Prompt, PromptInsert, PromptUpdate } from "../database.types";

interface PromptContextType {
  // State management
  prompts: Prompt[];
  loading: boolean;
  
  // CRUD operations
  getPromptById: (id: string) => Promise<Prompt | null>;
  getUserPrompts: (userId: string, limit?: number) => Promise<Prompt[]>;
  createPrompt: (prompt: PromptInsert) => Promise<Prompt>;
  updatePrompt: (id: string, updates: PromptUpdate) => Promise<Prompt>;
  deletePrompt: (id: string) => Promise<void>;
  updatePromptStatus: (id: string, status: Prompt["status"]) => Promise<Prompt>;
  getPromptsByType: (userId: string, type: "image" | "video", limit?: number) => Promise<Prompt[]>;
  
  // Utility methods
  refreshUserPrompts: () => Promise<void>;
  getRecentPrompts: (limit?: number) => Promise<Prompt[]>;
  searchPrompts: (query: string, userId: string) => Promise<Prompt[]>;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export const PromptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const { user: authUser } = useAuth();

  // Load user prompts when auth user changes
  useEffect(() => {
    if (authUser?.id) {
      refreshUserPrompts();
    } else {
      setPrompts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  // CRUD Operations
  const getPromptById = async (id: string): Promise<Prompt | null> => {
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to get prompt: ${error.message}`);
    }
    return data;
  };

  const getUserPrompts = async (userId: string, limit = 50): Promise<Prompt[]> => {
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Failed to get user prompts: ${error.message}`);
    }
    return data || [];
  };

  const createPrompt = async (prompt: PromptInsert): Promise<Prompt> => {
    const { data, error } = await supabase
      .from("prompts")
      .insert({
        ...prompt,
        language: prompt.language || "en",
        status: prompt.status || "pending",
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create prompt: ${error.message}`);
    }
    
    // Add to local state if it belongs to the current user
    if (authUser?.id === data.user_id) {
      setPrompts(prev => [data, ...prev]);
    }
    
    return data;
  };

  const updatePrompt = async (id: string, updates: PromptUpdate): Promise<Prompt> => {
    const { data, error } = await supabase
      .from("prompts")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update prompt: ${error.message}`);
    }
    
    // Update local state if it belongs to the current user
    if (authUser?.id === data.user_id) {
      setPrompts(prev => prev.map(p => p.id === data.id ? data : p));
    }
    
    return data;
  };

  const deletePrompt = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("prompts")
      .delete()
      .eq("id", id);
    
    if (error) {
      throw new Error(`Failed to delete prompt: ${error.message}`);
    }
    
    // Remove from local state
    setPrompts(prev => prev.filter(p => p.id !== id));
  };

  const updatePromptStatus = async (id: string, status: Prompt["status"]): Promise<Prompt> => {
    const { data, error } = await supabase
      .from("prompts")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update prompt status: ${error.message}`);
    }
    
    // Update local state if it belongs to the current user
    if (authUser?.id === data.user_id) {
      setPrompts(prev => prev.map(p => p.id === data.id ? data : p));
    }
    
    return data;
  };

  const getPromptsByType = async (userId: string, type: "image" | "video", limit = 50): Promise<Prompt[]> => {
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("user_id", userId)
      .eq("type", type)
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Failed to get prompts by type: ${error.message}`);
    }
    return data || [];
  };

  // Utility Methods
  const refreshUserPrompts = async (): Promise<void> => {
    if (!authUser?.id) return;
    
    setLoading(true);
    try {
      const userPrompts = await getUserPrompts(authUser.id);
      setPrompts(userPrompts);
    } catch (error) {
      console.error("Failed to refresh user prompts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRecentPrompts = async (limit = 10): Promise<Prompt[]> => {
    if (!authUser?.id) return [];
    
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Failed to get recent prompts: ${error.message}`);
    }
    return data || [];
  };

  const searchPrompts = async (query: string, userId: string): Promise<Prompt[]> => {
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("user_id", userId)
      .ilike("prompt", `%${query}%`)
      .order("created_at", { ascending: false })
      .limit(50);
    
    if (error) {
      throw new Error(`Failed to search prompts: ${error.message}`);
    }
    return data || [];
  };

  const contextValue: PromptContextType = {
    prompts,
    loading,
    getPromptById,
    getUserPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    updatePromptStatus,
    getPromptsByType,
    refreshUserPrompts,
    getRecentPrompts,
    searchPrompts,
  };

  return (
    <PromptContext.Provider value={contextValue}>
      {children}
    </PromptContext.Provider>
  );
};

/**
 * Custom hook to use the Prompt Context
 * @returns Prompt context with operations and state management
 * @throws Error if used outside PromptProvider
 */
export const usePrompt = (): PromptContextType => {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error("usePrompt must be used within a PromptProvider");
  }
  return context;
}; 