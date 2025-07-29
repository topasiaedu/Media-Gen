/**
 * Video Context
 * Dedicated context for Video table CRUD operations
 * Manages video generation, status polling, and playback
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import type { Video, VideoInsert, VideoUpdate } from "../database.types";

interface VideoContextType {
  // State management
  videos: Video[];
  loading: boolean;
  
  // CRUD operations
  getVideoById: (id: string) => Promise<Video | null>;
  getVideosByPromptId: (promptId: string) => Promise<Video[]>;
  getUserVideos: (userId: string, limit?: number) => Promise<Video[]>;
  createVideo: (video: VideoInsert) => Promise<Video>;
  updateVideo: (id: string, updates: VideoUpdate) => Promise<Video>;
  deleteVideo: (id: string) => Promise<void>;
  updateVideoStatus: (id: string, status: Video["status"], url?: string, errorMessage?: string) => Promise<Video>;
  getVideoByTaskId: (taskId: string) => Promise<Video | null>;
  
  // Utility methods
  refreshUserVideos: () => Promise<void>;
  getRecentVideos: (limit?: number) => Promise<Video[]>;
  getVideosByStatus: (userId: string, status: Video["status"]) => Promise<Video[]>;
  downloadVideo: (videoUrl: string, filename?: string) => Promise<void>;
  pollVideoStatus: (videoId: string, onStatusChange?: (video: Video) => void) => () => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const { user: authUser } = useAuth();

  // Load user videos when auth user changes
  useEffect(() => {
    if (authUser?.id) {
      refreshUserVideos();
    } else {
      setVideos([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  // CRUD Operations
  const getVideoById = async (id: string): Promise<Video | null> => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to get video: ${error.message}`);
    }
    return data;
  };

  const getVideosByPromptId = async (promptId: string): Promise<Video[]> => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("prompt_id", promptId)
      .order("created_at", { ascending: false });
    
    if (error) {
      throw new Error(`Failed to get videos by prompt: ${error.message}`);
    }
    return data || [];
  };

  const getUserVideos = async (userId: string, limit = 50): Promise<Video[]> => {
    const { data, error } = await supabase
      .from("videos")
      .select(`
        *,
        prompts!inner(user_id)
      `)
      .eq("prompts.user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Failed to get user videos: ${error.message}`);
    }
    return data || [];
  };

  const createVideo = async (video: VideoInsert): Promise<Video> => {
    const { data, error } = await supabase
      .from("videos")
      .insert({
        ...video,
        status: video.status || "queued",
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create video: ${error.message}`);
    }
    
    // Add to local state if it belongs to the current user
    const { data: promptData } = await supabase
      .from("prompts")
      .select("user_id")
      .eq("id", data.prompt_id)
      .single();
    
    if (promptData && authUser?.id === promptData.user_id) {
      setVideos(prev => [data, ...prev]);
    }
    
    return data;
  };

  const updateVideo = async (id: string, updates: VideoUpdate): Promise<Video> => {
    const { data, error } = await supabase
      .from("videos")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update video: ${error.message}`);
    }
    
    // Update local state
    setVideos(prev => prev.map(vid => vid.id === data.id ? data : vid));
    
    return data;
  };

  const deleteVideo = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", id);
    
    if (error) {
      throw new Error(`Failed to delete video: ${error.message}`);
    }
    
    // Remove from local state
    setVideos(prev => prev.filter(vid => vid.id !== id));
  };

  const updateVideoStatus = async (
    id: string, 
    status: Video["status"], 
    url?: string, 
    errorMessage?: string
  ): Promise<Video> => {
    const updates: VideoUpdate = {
      status,
      updated_at: new Date().toISOString(),
    };
    
    if (url) updates.url = url;
    if (errorMessage) updates.error_message = errorMessage;

    const { data, error } = await supabase
      .from("videos")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update video status: ${error.message}`);
    }
    
    // Update local state
    setVideos(prev => prev.map(vid => vid.id === data.id ? data : vid));
    
    return data;
  };

  const getVideoByTaskId = async (taskId: string): Promise<Video | null> => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .eq("task_id", taskId)
      .single();
    
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to get video by task ID: ${error.message}`);
    }
    return data;
  };

  // Utility Methods
  const refreshUserVideos = async (): Promise<void> => {
    if (!authUser?.id) return;
    
    setLoading(true);
    try {
      const userVideos = await getUserVideos(authUser.id);
      setVideos(userVideos);
    } catch (error) {
      console.error("Failed to refresh user videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRecentVideos = async (limit = 10): Promise<Video[]> => {
    if (!authUser?.id) return [];
    
    const { data, error } = await supabase
      .from("videos")
      .select(`
        *,
        prompts!inner(user_id)
      `)
      .eq("prompts.user_id", authUser.id)
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) {
      throw new Error(`Failed to get recent videos: ${error.message}`);
    }
    return data || [];
  };

  const getVideosByStatus = async (userId: string, status: Video["status"]): Promise<Video[]> => {
    const { data, error } = await supabase
      .from("videos")
      .select(`
        *,
        prompts!inner(user_id)
      `)
      .eq("prompts.user_id", userId)
      .eq("status", status)
      .order("created_at", { ascending: false });
    
    if (error) {
      throw new Error(`Failed to get videos by status: ${error.message}`);
    }
    return data || [];
  };

  const downloadVideo = async (videoUrl: string, filename = "generated-video.mp4"): Promise<void> => {
    try {
      const response = await fetch(videoUrl);
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
      throw new Error(`Failed to download video: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const pollVideoStatus = (videoId: string, onStatusChange?: (video: Video) => void): (() => void) => {
    const intervalId = setInterval(async () => {
      try {
        const video = await getVideoById(videoId);
        if (video) {
          // Update local state
          setVideos(prev => prev.map(vid => vid.id === video.id ? video : vid));
          
          // Call callback
          onStatusChange?.(video);
          
          // Stop polling if video is in final state
          if (video.status === "succeeded" || video.status === "failed" || video.status === "cancelled") {
            clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error("Failed to poll video status:", error);
        clearInterval(intervalId);
      }
    }, 5000); // Poll every 5 seconds

    // Return cleanup function
    return () => clearInterval(intervalId);
  };

  const contextValue: VideoContextType = {
    videos,
    loading,
    getVideoById,
    getVideosByPromptId,
    getUserVideos,
    createVideo,
    updateVideo,
    deleteVideo,
    updateVideoStatus,
    getVideoByTaskId,
    refreshUserVideos,
    getRecentVideos,
    getVideosByStatus,
    downloadVideo,
    pollVideoStatus,
  };

  return (
    <VideoContext.Provider value={contextValue}>
      {children}
    </VideoContext.Provider>
  );
};

/**
 * Custom hook to use the Video Context
 * @returns Video context with operations and state management
 * @throws Error if used outside VideoProvider
 */
export const useVideo = (): VideoContextType => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
}; 