/**
 * History Page
 * User's generation history page
 */

import React, { useState, useEffect } from "react";
import { Image, Video, Download, Trash2, Calendar, Filter, Search, Eye } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useImage } from "../contexts/ImageContext";
import { useVideo } from "../contexts/VideoContext";
import { usePrompt } from "../contexts/PromptContext";
import { PreviewModal, PreviewItem } from "../components/PreviewModal";

interface GenerationItem {
  id: string;
  type: "image" | "video";
  prompt: string;
  url: string;
  createdAt: string;
  settings: {
    model: string;
    size?: string;
    duration?: number;
    aspectRatio?: string;
  };
  promptId: string;
}

/**
 * History Page Component
 * Displays user's past image and video generations with enhanced filtering
 */
export const HistoryPage: React.FC = () => {
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [generationItems, setGenerationItems] = useState<GenerationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [previewItem, setPreviewItem] = useState<PreviewItem | null>(null);
  
  // Hooks
  const { user } = useAuth();
  const { getUserImages, deleteImage, downloadImage } = useImage();
  const { getUserVideos, deleteVideo, downloadVideo } = useVideo();
  const { getUserPrompts } = usePrompt();

  // Load user's generation history
  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.id) {
        setGenerationItems([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get user's prompts, images, and videos
        const [userPrompts, userImages, userVideos] = await Promise.all([
          getUserPrompts(user.id, 100),
          getUserImages(user.id, 100),
          getUserVideos(user.id, 100)
        ]);

        // Create a map of prompts for easy lookup
        const promptMap = new Map(userPrompts.map(p => [p.id, p]));

        // Combine images and videos into generation items
        const items: GenerationItem[] = [];

        // Add images
        userImages.forEach(image => {
          const prompt = promptMap.get(image.prompt_id);
          if (prompt) {
            items.push({
              id: image.id,
              type: "image",
              prompt: prompt.prompt,
              url: image.url,
              createdAt: image.created_at,
              settings: {
                model: prompt.model_used || "unknown",
                size: image.size
              },
              promptId: image.prompt_id
            });
          }
        });

        // Add videos
        userVideos.forEach(video => {
          const prompt = promptMap.get(video.prompt_id);
          if (prompt) {
            items.push({
              id: video.id,
              type: "video",
              prompt: prompt.prompt,
              url: video.url || "",
              createdAt: video.created_at,
              settings: {
                model: prompt.model_used || "unknown",
                duration: video.duration || undefined,
                aspectRatio: video.aspect_ratio || undefined
              },
              promptId: video.prompt_id
            });
          }
        });

        setGenerationItems(items);
      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user?.id, getUserPrompts, getUserImages, getUserVideos]);

  /**
   * Filter and sort the history items
   */
  const filteredHistory = generationItems
    .filter(item => {
      // Type filter
      if (filterType !== "all" && item.type !== filterType) return false;
      
      // Search filter
      if (searchQuery && !item.prompt.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      
      switch (sortBy) {
        case "newest":
          return dateB - dateA;
        case "oldest":
          return dateA - dateB;
        default:
          return dateB - dateA;
      }
    });

  /**
   * Format date for display
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  /**
   * Handle item deletion
   */
  const handleDelete = async (item: GenerationItem): Promise<void> => {
    try {
      if (item.type === "image") {
        await deleteImage(item.id);
      } else {
        await deleteVideo(item.id);
      }
      
      // Remove from local state
      setGenerationItems(prev => prev.filter(historyItem => historyItem.id !== item.id));
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  /**
   * Handle download
   */
  const handleDownload = async (item: GenerationItem): Promise<void> => {
    try {
      const filename = `${item.prompt.slice(0, 30).replace(/[^a-zA-Z0-9\\s]/g, '').replace(/\\s+/g, '_')}_${Date.now()}.${item.type === 'image' ? 'png' : 'mp4'}`;
      
      if (item.type === "image") {
        await downloadImage(item.url, filename);
      } else {
        await downloadVideo(item.url, filename);
      }
    } catch (error) {
      console.error("Failed to download item:", error);
      alert("Failed to download item. Please try again.");
    }
  };

  /**
   * Open preview modal for an item
   */
  const openPreview = (item: GenerationItem): void => {
    const previewData: PreviewItem = {
      id: item.id,
      type: item.type,
      url: item.url,
      prompt: item.prompt,
      createdAt: item.createdAt,
      settings: item.settings
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
    const generationItem: GenerationItem = {
      id: item.id,
      type: item.type,
      url: item.url,
      prompt: item.prompt,
      createdAt: item.createdAt || new Date().toISOString(),
      settings: {
        model: item.settings?.model || "unknown",
        size: item.settings?.size,
        duration: item.settings?.duration,
        aspectRatio: item.settings?.aspectRatio
      },
      promptId: "" // Not needed for download
    };
    handleDownload(generationItem);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Generation History
          </h1>
          <p className="text-lg text-gray-600">
            View and manage your past AI generations
          </p>
        </div>

        {/* Enhanced Filters */}
        <div className="card mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by prompt keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Type and Favorites Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Filter size={20} className="text-gray-500" />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFilterType("all")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filterType === "all"
                          ? "bg-primary-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      All ({generationItems.length})
                    </button>
                    <button
                      onClick={() => setFilterType("image")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                        filterType === "image"
                          ? "bg-primary-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <Image size={16} className="mr-2" />
                      Images ({generationItems.filter(item => item.type === "image").length})
                    </button>
                    <button
                      onClick={() => setFilterType("video")}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                        filterType === "video"
                          ? "bg-primary-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <Video size={16} className="mr-2" />
                      Videos ({generationItems.filter(item => item.type === "video").length})
                    </button>
                  </div>
                </div>


              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-4">
                <Calendar size={20} className="text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredHistory.length} of {generationItems.length} generations
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* History Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Loading your history...</h3>
            <p className="text-gray-500">Please wait while we fetch your generations</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              {filterType === "all" ? (
                <Image size={64} className="mx-auto" />
              ) : filterType === "image" ? (
                <Image size={64} className="mx-auto" />
              ) : (
                <Video size={64} className="mx-auto" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No {filterType === "all" ? "" : filterType} generations found
            </h3>
            <p className="text-gray-500">
              {searchQuery ? "Try adjusting your search terms" : "Start creating to see your generations here"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredHistory.map((item) => (
              <div key={item.id} className="card hover:shadow-xl transition-shadow duration-300 group">
                {/* Media Preview */}
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden relative group">
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt="Generated content"
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => openPreview(item)}
                    />
                  ) : (
                    <div className="relative w-full h-full cursor-pointer" onClick={() => openPreview(item)}>
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                        <Video className="text-white" size={32} />
                      </div>
                    </div>
                  )}
                  
                  {/* Preview overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <button
                      onClick={() => openPreview(item)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100"
                      title={`Preview ${item.type}`}
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                </div>

                {/* Content Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {item.type === "image" ? (
                        <Image size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Video size={16} className="text-purple-500 flex-shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {item.type}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-3">
                    {item.prompt}
                  </p>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Model: {item.settings.model}</p>
                    {item.settings.size && <p>Size: {item.settings.size}</p>}
                    {item.settings.duration && <p>Duration: {item.settings.duration}s</p>}
                    {item.settings.aspectRatio && <p>Ratio: {item.settings.aspectRatio}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => openPreview(item)}
                      className="flex-1 btn-secondary text-sm flex items-center justify-center"
                    >
                      <Eye size={14} className="mr-1" />
                      Preview
                    </button>
                    <button
                      onClick={() => handleDownload(item)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Download size={14} className="mr-1" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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