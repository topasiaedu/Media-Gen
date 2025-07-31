/**
 * useVideoGeneration Hook
 * Custom hook for video generation functionality - backend handles polling internally
 */

import { useState, useCallback } from "react";
import { videoApi } from "../api/videoApi";
import type { GenerateVideoParams, GeneratedVideoResult } from "../api/videoApi";
import { useAuth } from "./useAuth";

interface UseVideoGenerationState {
  loading: boolean;
  error: string | null;
  progress: {
    step: "idle" | "generating" | "completed";
    message: string;
  };
}

interface UseVideoGenerationResult extends UseVideoGenerationState {
  generateVideo: (params: Omit<GenerateVideoParams, "userId">) => Promise<GeneratedVideoResult | null>;
  testConnection: (prompt: string) => Promise<void>;
  clearError: () => void;
}

export const useVideoGeneration = (): UseVideoGenerationResult => {
  const [state, setState] = useState<UseVideoGenerationState>({
    loading: false,
    error: null,
    progress: {
      step: "idle",
      message: ""
    }
  });

  const { user } = useAuth();

  const updateProgress = useCallback((
    step: UseVideoGenerationState["progress"]["step"], 
    message: string
  ) => {
    setState(prev => ({
      ...prev,
      progress: { step, message }
    }));
  }, []);



  const generateVideo = useCallback(async (
    params: Omit<GenerateVideoParams, "userId">
  ): Promise<GeneratedVideoResult | null> => {
    if (!user?.id) {
      setState(prev => ({
        ...prev,
        error: "User must be authenticated to generate videos"
      }));
      return null;
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      updateProgress("generating", "Generating video (this may take 2-10 minutes)...");

      const result = await videoApi.generateVideo({
        ...params,
        userId: user.id
      });

      updateProgress("completed", "Video generation completed successfully!");

      setState(prev => ({
        ...prev,
        loading: false,
        progress: {
          step: "idle",
          message: ""
        }
      }));

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        progress: {
          step: "idle",
          message: ""
        }
      }));

      console.error("Video generation failed:", error);
      return null;
    }
  }, [user?.id, updateProgress]);



  const testConnection = useCallback(async (prompt: string): Promise<void> => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      const result = await videoApi.testApiConnection(prompt);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: null
        }));
        alert(`Video API Test Success! ${result.data?.success ? 'Connection verified' : 'Test completed'}`);
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error || "Test failed"
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Test failed"
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  return {
    ...state,
    generateVideo,
    testConnection,
    clearError
  };
}; 