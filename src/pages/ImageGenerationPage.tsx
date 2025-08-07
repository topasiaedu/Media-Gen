import React, { useState, useEffect } from "react";
import { Image, Download, RefreshCw, Wand2, Copy, Sparkles, AlertCircle, Eye } from "lucide-react";
import { useImageGeneration } from "../hooks/useImageGeneration";
import { useImage } from "../contexts/ImageContext";
import { useAuth } from "../hooks/useAuth";
import { PreviewModal, PreviewItem } from "../components/PreviewModal";

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
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewItem, setPreviewItem] = useState<PreviewItem | null>(null);

  // Hooks
  const { generateImage, loading, error, progress, clearError } = useImageGeneration();
  const { getRecentImages, downloadImage } = useImage();
  const { user } = useAuth();

  // Load most recent image on component mount
  useEffect(() => {
    const loadRecentImage = async () => {
      try {
        const recent = await getRecentImages(1);
        if (recent.length > 0) {
          const latestImage: ImageGeneration = {
            id: recent[0].id,
            prompt: "", // We'd need to join with prompts table to get this
            url: recent[0].url,
            bucketUrl: recent[0].url, // For now, using the same URL
            timestamp: new Date(recent[0].created_at).toLocaleString(),
            size: recent[0].size
          };
          setGeneratedImages([latestImage]);
        }
      } catch (error) {
        console.error("Failed to load recent image:", error);
      }
    };

    if (user) {
      loadRecentImage();
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
        model: "seedream-3-0-t2i-250415",
        size: "1024x1024"
      });

      if (result && result.images.length > 0) {
        // Replace current image with the new one (only show latest)
        const newImage: ImageGeneration = {
          id: result.images[0].id,
          prompt: prompt.trim(),
          url: result.images[0].url,
          bucketUrl: result.images[0].bucketUrl,
          timestamp: "Just now",
          size: result.images[0].size
        };
        
        setGeneratedImages([newImage]);
        
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
   * Handle image download with proper filename
   */
  const handleDownloadImage = async (imageUrl: string, prompt: string): Promise<void> => {
    try {
      // Create a descriptive filename from the prompt
      const cleanPrompt = prompt.slice(0, 50).replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      const filename = `${cleanPrompt || 'generated'}_${Date.now()}.png`;
      await downloadImage(imageUrl, filename);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download image. Please try again.");
    }
  };

  /**
   * Open preview modal for an image
   */
  const openPreview = (image: ImageGeneration): void => {
    const previewData: PreviewItem = {
      id: image.id,
      type: "image",
      url: image.bucketUrl || image.url,
      prompt: image.prompt || "Generated image",
      createdAt: image.timestamp,
      settings: {
        size: image.size
      }
    };
    setPreviewItem(previewData);
    setIsPreviewOpen(true);
  };

  /**
   * Close preview modal
   */
  const closePreview = (): void => {
    setIsPreviewOpen(false);
    setPreviewItem(null);
  };

  /**
   * Handle download from preview modal
   */
  const handlePreviewDownload = (item: PreviewItem): void => {
    handleDownloadImage(item.url, item.prompt);
  };

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


          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Generated Image Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Image</h2>
              
              {generatedImages.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="relative group">
                    <img
                      src={generatedImages[0].bucketUrl || generatedImages[0].url}
                      alt={generatedImages[0].prompt || "Generated image"}
                      className="w-full aspect-square object-cover"
                      onError={(e) => {
                        // Fallback to original URL if bucket URL fails
                        const target = e.target as HTMLImageElement;
                        if (target.src !== generatedImages[0].url) {
                          target.src = generatedImages[0].url;
                        }
                      }}
                    />
                    {/* Preview overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <button
                        onClick={() => openPreview(generatedImages[0])}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
                        title="Preview Image"
                      >
                        <Eye size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    {generatedImages[0].prompt && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {generatedImages[0].prompt}
                      </p>
                    )}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openPreview(generatedImages[0])}
                        className="flex-1 btn-secondary text-sm flex items-center justify-center"
                      >
                        <Eye className="mr-1" size={14} />
                        Preview
                      </button>
                      <button 
                        onClick={() => handleDownloadImage(generatedImages[0].bucketUrl || generatedImages[0].url, generatedImages[0].prompt || 'generated-image')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center"
                      >
                        <Download className="mr-1" size={14} />
                        Download
                      </button>
                    </div>
                  </div>
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


          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        item={previewItem}
        onDownload={handlePreviewDownload}
      />
    </div>
  );
}; 