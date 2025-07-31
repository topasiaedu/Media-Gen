/**
 * Video Generation Page
 * Dedicated page for video generation workflow with polling support
 */

import React, { useState, useRef } from "react";
import { Video, Upload, Download, RefreshCw, Play, Pause, Wand2, Sparkles, AlertCircle, X } from "lucide-react";
import { useVideoGeneration } from "../hooks/useVideoGeneration";
import { useAuth } from "../hooks/useAuth";

interface VideoGeneration {
  id: string;
  prompt: string;
  url: string;
  duration: number;
  aspectRatio: string;
  timestamp: string;
}

/**
 * Video Generation Page Component
 * Provides interface for generating videos from text prompts and images
 */
export const VideoGenerationPage: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [generatedVideos, setGeneratedVideos] = useState<VideoGeneration[]>([]);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoSettings, setVideoSettings] = useState({
    duration: "5",
    aspectRatio: "16:9"
  });
  // Hooks
  const { generateVideo, loading, error, progress, clearError } = useVideoGeneration();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Example prompts for inspiration
  const examplePrompts = [
    "A beautiful butterfly flying over a field of colorful flowers, slow motion, cinematic",
    "Ocean waves crashing against rocks at sunset, dramatic lighting",
    "A cute cat playing with a ball of yarn in a cozy living room",
    "Abstract geometric patterns morphing and changing colors",
    "A peaceful forest scene with sunlight filtering through trees"
  ];

  /**
   * Handle video generation using the new hook
   */
  const handleGenerate = async (): Promise<void> => {
    if (!prompt.trim()) return;
    if (!user) {
      alert("Please log in to generate videos");
      return;
    }
    
    clearError();
    
    try {
      const params = {
        prompt: prompt.trim(),
        duration: videoSettings.duration,
        aspectRatio: videoSettings.aspectRatio,
        image: uploadedImage || undefined
      };

      const result = await generateVideo(params);

      if (result && result.video_url) {
        // Replace current video with the new one (only show latest)
        const newVideo: VideoGeneration = {
          id: result.task_id,
          prompt: prompt.trim(),
          url: result.video_url,
          duration: result.duration,
          aspectRatio: result.aspectRatio,
          timestamp: "Just now"
        };
        
        setGeneratedVideos([newVideo]);
        
        // Clear the prompt after successful generation
        setPrompt("");
      }
    } catch (error) {
      console.error("Video generation failed:", error);
    }
  };

  /**
   * Handle image upload for image-to-video generation
   */
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Remove uploaded image
   */
  const removeUploadedImage = (): void => {
    setUploadedImage(null);
    setUploadedImagePreview(null);
  };

  /**
   * Copy prompt to clipboard
   */
  const copyPrompt = (promptText: string): void => {
    navigator.clipboard.writeText(promptText);
    setPrompt(promptText);
  };

  /**
   * Handle video play/pause
   */
  const togglePlayPause = (): void => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  /**
   * Handle video download
   */
  const handleDownloadVideo = async (videoUrl: string, promptText: string): Promise<void> => {
    try {
      const cleanPrompt = promptText.slice(0, 50).replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      const filename = `${cleanPrompt || 'generated'}_video_${Date.now()}.mp4`;
      
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download video:", error);
      alert("Failed to download video. Please try again.");
    }
  };

  const aspectRatioOptions = [
    { label: "21:9 (Ultra-wide)", value: "21:9" },
    { label: "16:9 (Landscape)", value: "16:9" },
    { label: "4:3 (Traditional)", value: "4:3" },
    { label: "1:1 (Square)", value: "1:1" },
    { label: "3:4 (Portrait)", value: "3:4" },
    { label: "9:16 (Vertical)", value: "9:16" },
    { label: "9:21 (Ultra-tall)", value: "9:21" },
    { label: "Adaptive (Auto-detect from image)", value: "adaptive" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Video Generation
          </h1>
          <p className="text-lg text-gray-600">
            Create captivating videos from text descriptions and images
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
              <X size={20} />
            </button>
          </div>
        )}

        {/* Authentication Warning */}
        {!user && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Please log in to generate videos with AI.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Wand2 className="mr-2" size={20} />
                Video Prompt
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="video-prompt" className="block text-sm font-medium text-gray-700 mb-2">
                    Describe the video you want to generate
                  </label>
                  <textarea
                    id="video-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="A beautiful butterfly flying over a field of flowers, slow motion, cinematic..."
                    disabled={loading}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starting Image (Optional for Image-to-Video)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    {uploadedImagePreview ? (
                      <div className="relative">
                        <img
                          src={uploadedImagePreview}
                          alt="Starting frame for video"
                          className="max-h-32 mx-auto rounded"
                        />
                        <button
                          onClick={removeUploadedImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                        <p className="text-gray-600 mb-2">Upload an image to create image-to-video</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg cursor-pointer inline-block transition-colors"
                        >
                          Choose Image
                        </label>
                      </div>
                    )}
                  </div>
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
                      Generate Video
                    </>
                  )}
                </button>


              </div>
            </div>

            {/* Example Prompts */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Prompts</h3>
              <div className="grid grid-cols-1 gap-2">
                {examplePrompts.map((examplePrompt, index) => (
                  <button
                    key={index}
                    onClick={() => copyPrompt(examplePrompt)}
                    className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                  >
                    "{examplePrompt}"
                  </button>
                ))}
              </div>
            </div>

            {/* Settings Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <select
                    value={videoSettings.duration}
                    onChange={(e) => setVideoSettings({...videoSettings, duration: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="5">5 seconds</option>
                    <option value="10">10 seconds</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aspect Ratio
                  </label>
                  <select
                    value={videoSettings.aspectRatio}
                    onChange={(e) => setVideoSettings({...videoSettings, aspectRatio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {aspectRatioOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>


              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Generated Video Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Video</h2>
              
              {generatedVideos.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="aspect-video relative">
                    <video
                      ref={videoRef}
                      src={generatedVideos[0].url}
                      className="w-full h-full object-cover"
                      controls
                      muted
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  </div>
                  <div className="p-3">
                    {generatedVideos[0].prompt && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {generatedVideos[0].prompt}
                      </p>
                    )}
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleDownloadVideo(generatedVideos[0].url, generatedVideos[0].prompt)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center"
                      >
                        <Download className="mr-1" size={14} />
                        Download
                      </button>
                      <button 
                        onClick={togglePlayPause}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center"
                      >
                        {isPlaying ? <Pause className="mr-1" size={14} /> : <Play className="mr-1" size={14} />}
                        {isPlaying ? 'Pause' : 'Play'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                  {loading ? (
                    <div className="text-center">
                      <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
                      <p className="text-gray-600 mb-2">{progress.message || "Generating your video..."}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Video generation can take 2-10 minutes
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <Video size={64} className="mx-auto mb-4 opacity-20" />
                      <p>Your generated video will appear here</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 