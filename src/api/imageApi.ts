/**
 * Image Generation API
 * Handles image generation API calls to backend server
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

/**
 * Interface for the complete image generation flow
 */
export interface GenerateImageParams {
  prompt: string;
  model?: string;
  size?: string;
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
 * Generate image using backend API
 */
const generateImage = async (params: GenerateImageParams): Promise<GeneratedImageResult> => {
  const {
    prompt,
    model = "seedream-3-0-t2i-250415",
    size = "1024x1024",
    userId
  } = params;

  try {
    const response = await fetch(`${API_BASE_URL}/api/images/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model,
        size,
        userId,
        watermark: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error("Image generation failed:", error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server');
    }
    
    throw error instanceof Error ? error : new Error("Unknown error occurred during image generation");
  }
};

/**
 * Test API connection via backend
 */
const testApiConnection = async (prompt: string): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    console.log("Testing API connection via backend...");
    
    const response = await fetch(`${API_BASE_URL}/api/images/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt || "A simple test image"
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return { success: false, error: errorData.error || `HTTP ${response.status}: ${response.statusText}` };
    }

    const result = await response.json();
    console.log("Test successful:", result);
    
    return { success: true, data: result };
    
  } catch (error) {
    console.error("Test connection error:", error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { success: false, error: 'Network error: Unable to connect to the server' };
    }
    
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

/**
 * Get image from backend
 */
const getImageFromStorage = async (fileName: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/images/storage/${fileName}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get image: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error("Failed to get image from storage:", error);
    throw error instanceof Error ? error : new Error("Unknown error getting image");
  }
};

/**
 * Delete image via backend
 */
const deleteImageFromStorage = async (fileName: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/images/storage/${fileName}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Failed to delete image from storage:", error);
    throw error instanceof Error ? error : new Error("Unknown error deleting image");
  }
};

/**
 * Get available models from backend
 */
const getAvailableModels = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/images/models`);
    
    if (!response.ok) {
      console.warn("Failed to fetch models from backend, using fallback");
      return ["seedream-3-0-t2i-250415"]; // Fallback
    }
    
    const result = await response.json();
    return result.models || ["seedream-3-0-t2i-250415"];
  } catch (error) {
    console.warn("Failed to fetch models from backend, using fallback:", error);
    return ["seedream-3-0-t2i-250415"]; // Fallback
  }
};

export const imageApi = {
  generateImage,
  testApiConnection,
  getAvailableModels,
  getImageFromStorage,
  deleteImageFromStorage
}; 