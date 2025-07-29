import React, { useState, useEffect } from "react";
import { Image, Download, Share2, RefreshCw, Wand2, Copy, Heart, Sparkles, AlertCircle } from "lucide-react";
import { useImageGeneration } from "../hooks/useImageGeneration";
import { useImage } from "../contexts/ImageContext";
import { useAuth } from "../hooks/useAuth";

interface ImageGeneration {
  id: string;
  prompt: string;
  url: string;
  bucketUrl: string;
  timestamp: string;
  size: string;
}

/**
 * Image Generation Page Component
 * Provides interface for generating images from text prompts using ModelArk API
 */
export const ImageGenerationPage: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [generatedImages, setGeneratedImages] = useState<ImageGeneration[]>([]);
  const [imageSettings, setImageSettings] = useState({
    size: "1024x1024" as const,
    guidance_scale: 3,
    model: "seedream-3-0-t2i-250415",
    watermark: true
  });

  // Hooks
  const { generateImage, testConnection, loading, error, progress, clearError, availableModels } = useImageGeneration();
  const { images, getRecentImages } = useImage();
  const { user } = useAuth();

  // Load recent images on component mount
  useEffect(() => {
    const loadRecentImages = async () => {
      try {
        const recent = await getRecentImages(5);
        const mappedImages: ImageGeneration[] = recent.map(img => ({
          id: img.id,
          prompt: "", // We'd need to join with prompts table to get this
          url: img.url,
          bucketUrl: img.url, // For now, using the same URL
          timestamp: new Date(img.created_at).toLocaleString(),
          size: img.size
        }));
        setGeneratedImages(mappedImages);
      } catch (error) {
        console.error("Failed to load recent images:", error);
      }
    };

    if (user) {
      loadRecentImages();
    }
  }, [user, getRecentImages]);

  // Example prompts for inspiration
  const examplePrompts = [
    "A majestic dragon soaring through clouds with golden scales",
    "Minimalist modern architecture in a desert landscape", 
    "Vintage steampunk laboratory with intricate machinery",
    "Underwater coral reef teeming with colorful marine life",
    "Abstract geometric patterns in vibrant blues and purples"
  ];

  /**
   * Handle image generation using the real API
   */
  const handleGenerate = async (): Promise<void> => {
    if (!prompt.trim()) return;
    if (!user) {
      alert("Please log in to generate images");
      return;
    }
    
    clearError();
    
    try {
      const result = await generateImage({
        prompt: prompt.trim(),
        model: imageSettings.model,
        size: imageSettings.size,
        guidance_scale: imageSettings.guidance_scale,
        watermark: imageSettings.watermark
      });

      if (result && result.images.length > 0) {
        // Add new images to the display
        const newImages: ImageGeneration[] = result.images.map((img, index) => ({
          id: img.id,
          prompt: prompt.trim(),
          url: img.url,
          bucketUrl: img.bucketUrl,
          timestamp: "Just now",
          size: img.size
        }));
        
        setGeneratedImages(prev => [...newImages, ...prev]);
        
        // Clear the prompt after successful generation
        setPrompt("");
      }
    } catch (error) {
      console.error("Image generation failed:", error);
    }
  };

  /**
   * Copy prompt to clipboard
   */
  const copyPrompt = (promptText: string): void => {
    navigator.clipboard.writeText(promptText);
    setPrompt(promptText);
  };

  /**
   * Download image
   */
  const downloadImage = async (imageUrl: string, prompt: string): Promise<void> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download image");
    }
  };

  const sizeOptions = [
    { label: "Square (1024x1024)", value: "1024x1024" as const },
    { label: "Portrait (768x1024)", value: "768x1024" as const },
    { label: "Landscape (1024x768)", value: "1024x768" as const },
    { label: "Square Medium (768x768)", value: "768x768" as const },
    { label: "Square Small (512x512)", value: "512x512" as const }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Image Generation
          </h1>
          <p className="text-lg text-gray-600">
            Transform your ideas into stunning visuals with AI
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="text-red-500 mr-3" size={20} />
            <div>
              <p className="text-red-800 font-medium">Generation Failed</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Authentication Warning */}
        {!user && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Please log in to generate images with AI.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Wand2 className="mr-2" size={20} />
                Prompt
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                    Describe what you want to generate
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="A beautiful sunset over a mountain landscape, photorealistic, detailed..."
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || loading || !user}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="animate-spin mr-2" size={20} />
                      {progress.message || "Generating..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2" size={20} />
                      Generate Image
                    </>
                  )}
                </button>

                {/* Debug: Test API Connection */}
                <button
                  onClick={() => testConnection(prompt.trim() || "test prompt")}
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center mt-2"
                >
                  🔧 Test API Connection (Debug)
                </button>
              </div>
            </div>

            {/* Example Prompts */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">✨ Inspiration</h3>
              <div className="space-y-2">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => copyPrompt(example)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 text-sm text-gray-700 border border-gray-200 flex items-center justify-between group"
                    disabled={loading}
                  >
                    <span>{example}</span>
                    <Copy size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            {/* Settings Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Size
                  </label>
                  <select
                    value={imageSettings.size}
                    onChange={(e) => setImageSettings({...imageSettings, size: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    {sizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guidance Scale: {imageSettings.guidance_scale}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={imageSettings.guidance_scale}
                    onChange={(e) => setImageSettings({...imageSettings, guidance_scale: parseInt(e.target.value)})}
                    className="w-full"
                    disabled={loading}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Less strict</span>
                    <span>More strict</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <select
                    value={imageSettings.model}
                    onChange={(e) => setImageSettings({...imageSettings, model: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    {availableModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="watermark"
                    checked={imageSettings.watermark}
                    onChange={(e) => setImageSettings({...imageSettings, watermark: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="watermark" className="ml-2 block text-sm text-gray-700">
                    Add watermark
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Generated Images Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Images</h2>
              
              {generatedImages.length > 0 ? (
                <div className="space-y-4">
                  {generatedImages.slice(0, 3).map((image) => (
                    <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={image.bucketUrl || image.url}
                        alt={image.prompt || "Generated image"}
                        className="w-full aspect-square object-cover"
                        onError={(e) => {
                          // Fallback to original URL if bucket URL fails
                          const target = e.target as HTMLImageElement;
                          if (target.src !== image.url) {
                            target.src = image.url;
                          }
                        }}
                      />
                      <div className="p-3">
                        {image.prompt && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {image.prompt}
                          </p>
                        )}
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => downloadImage(image.bucketUrl || image.url, image.prompt)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center"
                          >
                            <Download className="mr-1" size={14} />
                            Download
                          </button>
                          <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm py-2 px-3 rounded-lg flex items-center justify-center">
                            <Share2 className="mr-1" size={14} />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Image size={64} className="mx-auto mb-4 opacity-20" />
                    <p>Your generated images will appear here</p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Generations */}
            {generatedImages.length > 3 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Generations</h3>
                <div className="space-y-3">
                  {generatedImages.slice(3).map((image) => (
                    <div key={image.id} className="flex space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <img
                        src={image.bucketUrl || image.url}
                        alt="Recent generation"
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== image.url) {
                            target.src = image.url;
                          }
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {image.prompt || "Generated image"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {image.timestamp} • {image.size}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 