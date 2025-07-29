/**
 * User Context
 * Dedicated context for User table CRUD operations
 * Manages user data and authentication state integration
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import type { User, UserInsert, UserUpdate } from "../database.types";

interface UserContextType {
  // Current user data
  currentUser: User | null;
  loading: boolean;
  
  // CRUD operations
  getUserById: (id: string) => Promise<User | null>;
  getUserByEmail: (email: string) => Promise<User | null>;
  createUser: (user: UserInsert) => Promise<User>;
  updateUser: (id: string, updates: UserUpdate) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  updateUserCredits: (id: string, credits: number) => Promise<User>;
  
  // Utility methods
  refreshCurrentUser: () => Promise<void>;
  deductCredits: (amount: number) => Promise<boolean>;
  addCredits: (amount: number) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: authUser } = useAuth();

  // Load current user data when auth user changes
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (authUser?.id) {
        try {
          // const userData = await getUserById(authUser.id);
          // setCurrentUser(userData);
        } catch (error) {
          // console.error("Failed to load current user:", error);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    };

    loadCurrentUser();
  }, [authUser]);

  // CRUD Operations
  const getUserById = async (id: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      if (error.code === "PGRST116") return null; // No rows found
      throw new Error(`Failed to get user: ${error.message}`);
    }
    return data;
  };

  const getUserByEmail = async (email: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to get user by email: ${error.message}`);
    }
    return data;
  };

  const createUser = async (user: UserInsert): Promise<User> => {
    const { data, error } = await supabase
      .from("users")
      .insert(user)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
    
    // Update current user if it's the authenticated user
    if (authUser?.id === data.id) {
      setCurrentUser(data);
    }
    
    return data;
  };

  const updateUser = async (id: string, updates: UserUpdate): Promise<User> => {
    const { data, error } = await supabase
      .from("users")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
    
    // Update current user if it's the authenticated user
    if (authUser?.id === data.id) {
      setCurrentUser(data);
    }
    
    return data;
  };

  const deleteUser = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);
    
    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
    
    // Clear current user if it's the authenticated user
    if (authUser?.id === id) {
      setCurrentUser(null);
    }
  };

  const updateUserCredits = async (id: string, credits: number): Promise<User> => {
    const { data, error } = await supabase
      .from("users")
      .update({ 
        credits_remaining: credits,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update user credits: ${error.message}`);
    }
    
    // Update current user if it's the authenticated user
    if (authUser?.id === data.id) {
      setCurrentUser(data);
    }
    
    return data;
  };

  // Utility Methods
  const refreshCurrentUser = async (): Promise<void> => {
    if (authUser?.id) {
      const userData = await getUserById(authUser.id);
      setCurrentUser(userData);
    }
  };

  const deductCredits = async (amount: number): Promise<boolean> => {
    if (!currentUser) {
      throw new Error("No current user to deduct credits from");
    }
    
    if (currentUser.credits_remaining < amount) {
      return false; // Insufficient credits
    }
    
    const newCredits = currentUser.credits_remaining - amount;
    await updateUserCredits(currentUser.id, newCredits);
    return true;
  };

  const addCredits = async (amount: number): Promise<void> => {
    if (!currentUser) {
      throw new Error("No current user to add credits to");
    }
    
    const newCredits = currentUser.credits_remaining + amount;
    await updateUserCredits(currentUser.id, newCredits);
  };

  const contextValue: UserContextType = {
    currentUser,
    loading,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    deleteUser,
    updateUserCredits,
    refreshCurrentUser,
    deductCredits,
    addCredits,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * Custom hook to use the User Context
 * @returns User context with operations and current user data
 * @throws Error if used outside UserProvider
 */
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}; 