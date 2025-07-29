/**
 * Image Generation API
 * Handles image generation API calls to ModelArk via serverless function and storage to Supabase
 */

import { supabase } from "../lib/supabase";
import type { PromptInsert, ImageInsert } from "../database.types";

/**
 * Interface for the complete image generation flow
 */
export interface GenerateImageParams {
  prompt: string;
  model?: string;
  size?: string;
  guidance_scale?: number;
  watermark?: boolean;
  userId: string;
}

export interface GeneratedImageResult {
  promptId: string;
  images: Array<{
    id: string;
    url: string;
    bucketUrl: string;
    size: string;
  }>;
}



/**
 * Generate image using our serverless function (avoids CORS issues)
 */
const generateImage = async (params: GenerateImageParams): Promise<GeneratedImageResult> => {
  const {
    prompt,
    model = "seedream-3-0-t2i-250415",
    size = "1024x1024",
    guidance_scale = 3,
    watermark = true,
    userId
  } = params;

  try {
    // Step 1: Create prompt record in database
    const promptData: PromptInsert = {
      user_id: userId,
      prompt,
      model_used: model,
      type: "image",
      size,
      guidance_scale,
      language: "en"
    };

    const { data: promptRecord, error: promptError } = await supabase
      .from("prompts")
      .insert(promptData)
      .select()
      .single();

    if (promptError) {
      throw new Error(`Failed to create prompt record: ${promptError.message}`);
    }

    // Step 2: Call our serverless function
    console.log("Generating image via serverless function...");
    console.log("Prompt:", prompt);
    console.log("Model:", model);
    console.log("Size:", size);

    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000/api/generate-image'
      : '/api/generate-image';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model,
        size,
        guidance_scale,
        watermark
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("API Response:", data);

    // Step 3: Process and save images
    const savedImages: Array<{
      id: string;
      url: string;
      bucketUrl: string;
      size: string;
    }> = [];

    // Check if response has data
    if (!data.data || data.data.length === 0) {
      throw new Error("No image data received from API");
    }

    for (let index = 0; index < data.data.length; index++) {
      const imageData = data.data[index];
      
      if (!imageData.url) {
        console.warn(`Image ${index} has no URL, skipping`);
        continue;
      }

      try {
        // Download image from ModelArk URL
        const imageBlob = await downloadImageAsBlob(imageData.url);
        
        // Upload to Supabase storage bucket
        const fileName = `${promptRecord.id}_${index + 1}_${Date.now()}.png`;
        const bucketUrl = await uploadImageToSupabase(imageBlob, fileName);

        // Save image record to database
        const imageRecord: ImageInsert = {
          prompt_id: promptRecord.id,
          url: imageData.url, // Original ModelArk URL
          size,
          file_size: imageBlob.size,
          mime_type: imageBlob.type || "image/png"
        };

        const { data: savedImage, error: imageError } = await supabase
          .from("images")
          .insert(imageRecord)
          .select()
          .single();

        if (imageError) {
          console.error(`Failed to save image ${index}:`, imageError);
          continue;
        }

        savedImages.push({
          id: savedImage.id,
          url: imageData.url,
          bucketUrl,
          size
        });

      } catch (imageError) {
        console.error(`Failed to process image ${index}:`, imageError);
        // Continue with other images
      }
    }

    // Step 4: Validate results
    if (savedImages.length === 0) {
      throw new Error("No images were successfully processed and saved");
    }

    return {
      promptId: promptRecord.id,
      images: savedImages
    };

  } catch (error) {
    console.error("Image generation failed:", error);
    throw error instanceof Error ? error : new Error("Unknown error occurred during image generation");
  }
};

/**
 * Test API connection using our serverless function
 */
const testApiConnection = async (prompt: string): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    console.log("Testing API connection via serverless function...");
    
    const apiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000/api/generate-image'
      : '/api/generate-image';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt || "A simple test image",
        model: "seedream-3-0-t2i-250415",
        size: "1024x1024",
        guidance_scale: 3,
        watermark: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Server error: ${response.status} - ${errorText}` };
    }

    const data = await response.json();
    console.log("Test successful:", data);
    
    // Check if response has data
    if (!data.data || data.data.length === 0) {
      return { success: false, error: "No image data received from API" };
    }
    
    return { success: true, data };
    
  } catch (error) {
    console.error("Test connection error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

/**
 * Download image from URL as Blob
 */
const downloadImageAsBlob = async (imageUrl: string): Promise<Blob> => {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }
  return await response.blob();
};

/**
 * Upload image blob to Supabase storage bucket
 */
const uploadImageToSupabase = async (imageBlob: Blob, fileName: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from("images")
    .upload(fileName, imageBlob, {
      contentType: imageBlob.type || "image/png",
      upsert: false
    });

  if (error) {
    throw new Error(`Failed to upload image to storage: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from("images")
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
};

/**
 * Get image from Supabase storage
 */
const getImageFromStorage = async (fileName: string): Promise<string> => {
  const { data } = supabase.storage
    .from("images")
    .getPublicUrl(fileName);

  return data.publicUrl;
};

/**
 * Delete image from Supabase storage
 */
const deleteImageFromStorage = async (fileName: string): Promise<void> => {
  const { error } = await supabase.storage
    .from("images")
    .remove([fileName]);

  if (error) {
    throw new Error(`Failed to delete image from storage: ${error.message}`);
  }
};

/**
 * List available models for image generation
 */
const getAvailableModels = (): string[] => {
  return [
    "seedream-3-0-t2i-250415",
    // Add more models as they become available
  ];
};

export const imageApi = {
  generateImage,
  testApiConnection,
  getAvailableModels,
  getImageFromStorage,
  deleteImageFromStorage
}; 