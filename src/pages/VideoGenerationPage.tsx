/**
 * Video Generation Page
 * Dedicated page for video generation workflow
 */

import React, { useState } from "react";
import { Video, Upload, Download, Share2, RefreshCw, Play, Pause } from "lucide-react";

/**
 * Video Generation Page Component
 * Provides interface for generating videos from text prompts and images
 */
export const VideoGenerationPage: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoSettings, setVideoSettings] = useState({
    duration: 4,
    aspectRatio: "16:9",
    model: "seedance-1-0-lite-t2v"
  });

  /**
   * Handle video generation (placeholder function)
   */
  const handleGenerate = async (): Promise<void> => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);
    
    // Simulate API call
    setTimeout(() => {
      clearInterval(progressInterval);
      setGenerationProgress(100);
      setGeneratedVideo("https://www.w3schools.com/html/mov_bbb.mp4");
      setIsGenerating(false);
    }, 8000);
  };

  /**
   * Handle image upload for image-to-video generation
   */
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const aspectRatioOptions = [
    { label: "16:9 (Landscape)", value: "16:9" },
    { label: "9:16 (Portrait)", value: "9:16" },
    { label: "1:1 (Square)", value: "1:1" }
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Video className="mr-2" size={20} />
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
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="A beautiful butterfly flying over a field of flowers, slow motion, cinematic..."
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starting Image (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                    {uploadedImage ? (
                      <div className="relative">
                        <img
                          src={uploadedImage}
                          alt="Uploaded"
                          className="max-h-32 mx-auto rounded"
                        />
                        <button
                          onClick={() => setUploadedImage(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                        <p className="text-gray-600 mb-2">Click to upload an image</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="btn-secondary cursor-pointer inline-block"
                        >
                          Choose Image
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="animate-spin mr-2" size={20} />
                      Generating... {generationProgress}%
                    </>
                  ) : (
                    <>
                      <Video className="mr-2" size={20} />
                      Generate Video
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration: {videoSettings.duration} seconds
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={videoSettings.duration}
                    onChange={(e) => setVideoSettings({...videoSettings, duration: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>2s</span>
                    <span>10s</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aspect Ratio
                  </label>
                  <select
                    value={videoSettings.aspectRatio}
                    onChange={(e) => setVideoSettings({...videoSettings, aspectRatio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {aspectRatioOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <select
                    value={videoSettings.model}
                    onChange={(e) => setVideoSettings({...videoSettings, model: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="seedance-1-0-lite-t2v">Seedance Text-to-Video</option>
                    <option value="runway-gen-2">Runway Gen-2</option>
                    <option value="stable-video">Stable Video Diffusion</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Video</h2>
            
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4 relative">
              {isGenerating ? (
                <div className="text-center">
                  <RefreshCw className="animate-spin mx-auto mb-4 text-primary-600" size={48} />
                  <p className="text-gray-600 mb-2">Generating your video...</p>
                  <div className="w-64 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : generatedVideo ? (
                <div className="w-full h-full relative">
                  <video
                    src={generatedVideo}
                    className="w-full h-full object-cover rounded-lg"
                    controls={false}
                    autoPlay={false}
                    muted
                  />
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="text-white" size={48} />
                    ) : (
                      <Play className="text-white" size={48} />
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <Video size={64} className="mx-auto mb-4 opacity-20" />
                  <p>Your generated video will appear here</p>
                </div>
              )}
            </div>

            {generatedVideo && !isGenerating && (
              <div className="flex space-x-3">
                <button className="flex-1 btn-primary flex items-center justify-center">
                  <Download className="mr-2" size={16} />
                  Download
                </button>
                <button className="flex-1 btn-secondary flex items-center justify-center">
                  <Share2 className="mr-2" size={16} />
                  Share
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 