/**
 * Video Generation API
 * Handles video generation API calls to backend server
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

/**
 * Interface for video generation parameters
 */
export interface GenerateVideoParams {
  prompt: string;
  duration?: string;
  aspectRatio?: string;
  userId: string;
  image?: File; // Optional starting image for image-to-video
}

/**
 * Interface for video generation result
 */
export interface GeneratedVideoResult {
  video_url: string;
  duration: number;
  aspectRatio: string;
  task_id: string;
}



/**
 * Generate video using backend API (backend handles polling internally)
 */
const generateVideo = async (params: GenerateVideoParams): Promise<GeneratedVideoResult> => {
  const {
    prompt,
    duration = "5",
    aspectRatio = "16:9",
    userId,
    image
  } = params;

  try {
    // Create form data for multipart upload
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('duration', duration);
    formData.append('aspectRatio', aspectRatio);
    formData.append('userId', userId);
    
    if (image) {
      formData.append('image', image);
    }

    const response = await fetch(`${API_BASE_URL}/api/videos/generate`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error("Video generation failed:", error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server');
    }
    
    throw error instanceof Error ? error : new Error("Unknown error occurred during video generation");
  }
};



/**
 * Test video API connection
 */
const testApiConnection = async (prompt: string): Promise<{ success: boolean; error?: string; data?: any }> => {
  try {
    console.log("Testing video API connection via backend...");
    
    const response = await fetch(`${API_BASE_URL}/api/videos/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt || "A simple test video"
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return { success: false, error: errorData.error || `HTTP ${response.status}: ${response.statusText}` };
    }

    const result = await response.json();
    console.log("Video API test successful:", result);
    
    return { success: true, data: result };
    
  } catch (error) {
    console.error("Video API test connection error:", error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { success: false, error: 'Network error: Unable to connect to the server' };
    }
    
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

export const videoApi = {
  generateVideo,
  testApiConnection
}; 