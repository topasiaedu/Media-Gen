/**
 * useImageGeneration Hook
 * Custom hook for image generation functionality with ModelArk API integration
 */

import { useState, useCallback, useEffect } from "react";
import { imageApi } from "../api/imageApi";
import type { GenerateImageParams, GeneratedImageResult } from "../api/imageApi";
import { useAuth } from "./useAuth";
import { useImage } from "../contexts/ImageContext";

interface UseImageGenerationState {
  loading: boolean;
  error: string | null;
  progress: {
    step: "idle" | "creating_prompt" | "generating" | "saving" | "completed";
    message: string;
  };
}

interface UseImageGenerationResult extends UseImageGenerationState {
  generateImage: (params: Omit<GenerateImageParams, "userId">) => Promise<GeneratedImageResult | null>;
  testConnection: (prompt: string) => Promise<void>;
  clearError: () => void;
  availableModels: string[];
  loadingModels: boolean;
}

export const useImageGeneration = (): UseImageGenerationResult => {
  const [state, setState] = useState<UseImageGenerationState>({
    loading: false,
    error: null,
    progress: {
      step: "idle",
      message: ""
    }
  });

  const [availableModels, setAvailableModels] = useState<string[]>(["seedream-3-0-t2i-250415"]);
  const [loadingModels, setLoadingModels] = useState<boolean>(false);

  const { user } = useAuth();
  const { refreshUserImages } = useImage();

  const updateProgress = useCallback((step: UseImageGenerationState["progress"]["step"], message: string) => {
    setState(prev => ({
      ...prev,
      progress: { step, message }
    }));
  }, []);

  const generateImage = useCallback(async (
    params: Omit<GenerateImageParams, "userId">
  ): Promise<GeneratedImageResult | null> => {
    if (!user?.id) {
      setState(prev => ({
        ...prev,
        error: "User must be authenticated to generate images"
      }));
      return null;
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      updateProgress("creating_prompt", "Creating prompt record...");

      updateProgress("generating", "Generating image with ModelArk API...");

      updateProgress("saving", "Saving image to storage...");

      const result = await imageApi.generateImage({
        ...params,
        userId: user.id
      });

      updateProgress("completed", "Image generation completed successfully!");

      // Refresh user images to update the UI
      await refreshUserImages();

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

      console.error("Image generation failed:", error);
      return null;
    }
  }, [user?.id, updateProgress, refreshUserImages]);

  const testConnection = useCallback(async (prompt: string): Promise<void> => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      const result = await imageApi.testApiConnection(prompt);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: null
        }));
        alert(`API Test Success! Generated image URL: ${result.data?.data?.[0]?.url || 'No URL'}`);
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

  // Load available models on component mount
  useEffect(() => {
    const loadModels = async () => {
      setLoadingModels(true);
      try {
        const models = await imageApi.getAvailableModels();
        setAvailableModels(models);
      } catch (error) {
        console.error("Failed to load models:", error);
        // Keep the fallback model
      } finally {
        setLoadingModels(false);
      }
    };

    loadModels();
  }, []);

  return {
    ...state,
    generateImage,
    testConnection,
    clearError,
    availableModels,
    loadingModels
  };
}; 