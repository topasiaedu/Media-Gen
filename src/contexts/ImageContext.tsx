/**
 * Image Context
 * Dedicated context for Image table CRUD operations
 * Manages image generation results, gallery, and downloads
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import type { Image, ImageInsert, ImageUpdate } from "../database.types";

interface ImageContextType {
  // State management
  images: Image[];
  loading: boolean;
  
  // CRUD operations
  getImageById: (id: string) => Promise<Image | null>;
  getImagesByPromptId: (promptId: string) => Promise<Image[]>;
  getUserImages: (userId: string, limit?: number) => Promise<Image[]>;
  createImage: (image: ImageInsert) => Promise<Image>;
  updateImage: (id: string, updates: ImageUpdate) => Promise<Image>;
  deleteImage: (id: string) => Promise<void>;
  bulkCreateImages: (images: ImageInsert[]) => Promise<Image[]>;
  
  // Utility methods
  refreshUserImages: () => Promise<void>;
  getRecentImages: (limit?: number) => Promise<Image[]>;
  downloadImage: (imageUrl: string, filename?: string) => Promise<void>;
  getImagesBySize: (userId: string, size: string) => Promise<Image[]>;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const { user: authUser } = useAuth();

  // Load user images when auth user changes
  useEffect(() => {
    if (authUser?.id) {
      refreshUserImages();
    } else {
      setImages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  // CRUD Operations
  const getImageById = async (id: string): Promise<Image | null> => {
    const { data, error } = await supabase
      .from("images")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to get image: ${error.message}`);
    }
    return data;
  };

  const getImagesByPromptId = async (promptId: string): Promise<Image[]> => {
    const { data, error } = await supabase
      .from("images")
      .select("*")
      .eq("prompt_id", promptId)
      .order("created_at", { ascending: false });
    
    if (error) {
      throw new Error(`Failed to get images by prompt: ${error.message}`);
    }
    return data || [];
  };

  const getUserImages = async (userId: string, limit = 50): Promise<Image[]> => {
    const { data, error } = await supabase
      .from("images")
      .select(`
        *,
        prompts!inner(user_id)
      `)
      .eq("prompts.user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Failed to get user images: ${error.message}`);
    }
    return data || [];
  };

  const createImage = async (image: ImageInsert): Promise<Image> => {
    const { data, error } = await supabase
      .from("images")
      .insert(image)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create image: ${error.message}`);
    }
    
    // Add to local state if it belongs to the current user
    // We need to check the prompt to determine ownership
    const { data: promptData } = await supabase
      .from("prompts")
      .select("user_id")
      .eq("id", data.prompt_id)
      .single();
    
    if (promptData && authUser?.id === promptData.user_id) {
      setImages(prev => [data, ...prev]);
    }
    
    return data;
  };

  const updateImage = async (id: string, updates: ImageUpdate): Promise<Image> => {
    const { data, error } = await supabase
      .from("images")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update image: ${error.message}`);
    }
    
    // Update local state
    setImages(prev => prev.map(img => img.id === data.id ? data : img));
    
    return data;
  };

  const deleteImage = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("images")
      .delete()
      .eq("id", id);
    
    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
    
    // Remove from local state
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const bulkCreateImages = async (images: ImageInsert[]): Promise<Image[]> => {
    const { data, error } = await supabase
      .from("images")
      .insert(images)
      .select();
    
    if (error) {
      throw new Error(`Failed to create images: ${error.message}`);
    }
    
    const createdImages = data || [];
    
    // Add to local state if they belong to the current user
    if (createdImages.length > 0 && authUser?.id) {
      // Check prompt ownership for the first image (assuming all images are from the same prompt)
      const { data: promptData } = await supabase
        .from("prompts")
        .select("user_id")
        .eq("id", createdImages[0].prompt_id)
        .single();
      
      if (promptData && authUser.id === promptData.user_id) {
        setImages(prev => [...createdImages, ...prev]);
      }
    }
    
    return createdImages;
  };

  // Utility Methods
  const refreshUserImages = async (): Promise<void> => {
    if (!authUser?.id) return;
    
    setLoading(true);
    try {
      const userImages = await getUserImages(authUser.id);
      setImages(userImages);
    } catch (error) {
      console.error("Failed to refresh user images:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRecentImages = async (limit = 10): Promise<Image[]> => {
    if (!authUser?.id) return [];
    
    const { data, error } = await supabase
      .from("images")
      .select(`
        *,
        prompts!inner(user_id)
      `)
      .eq("prompts.user_id", authUser.id)
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Failed to get recent images: ${error.message}`);
    }
    return data || [];
  };

  const downloadImage = async (imageUrl: string, filename = "generated-image.png"): Promise<void> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      throw new Error(`Failed to download image: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const getImagesBySize = async (userId: string, size: string): Promise<Image[]> => {
    const { data, error } = await supabase
      .from("images")
      .select(`
        *,
        prompts!inner(user_id)
      `)
      .eq("prompts.user_id", userId)
      .eq("size", size)
      .order("created_at", { ascending: false });
    
    if (error) {
      throw new Error(`Failed to get images by size: ${error.message}`);
    }
    return data || [];
  };

  const contextValue: ImageContextType = {
    images,
    loading,
    getImageById,
    getImagesByPromptId,
    getUserImages,
    createImage,
    updateImage,
    deleteImage,
    bulkCreateImages,
    refreshUserImages,
    getRecentImages,
    downloadImage,
    getImagesBySize,
  };

  return (
    <ImageContext.Provider value={contextValue}>
      {children}
    </ImageContext.Provider>
  );
};

/**
 * Custom hook to use the Image Context
 * @returns Image context with operations and state management
 * @throws Error if used outside ImageProvider
 */
export const useImage = (): ImageContextType => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImage must be used within a ImageProvider");
  }
  return context;
}; 