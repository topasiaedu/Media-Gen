/**
 * History Page
 * User's generation history page
 */

import React, { useState } from "react";
import { Image, Video, Download, Trash2, Calendar, Filter, Search, Star, Eye } from "lucide-react";

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
  isFavorite: boolean;
  downloadCount: number;
}

/**
 * History Page Component
 * Displays user's past image and video generations with enhanced filtering
 */
export const HistoryPage: React.FC = () => {
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  // Enhanced mock data for demonstration
  const [mockHistory, setMockHistory] = useState<GenerationItem[]>([
    {
      id: "1",
      type: "image",
      prompt: "A beautiful sunset over a mountain landscape, photorealistic, detailed, golden hour lighting",
      url: "https://via.placeholder.com/400x400/3b82f6/ffffff?text=Sunset+Mountains",
      createdAt: "2024-01-15T10:30:00Z",
      settings: {
        model: "stable-diffusion-xl",
        size: "1024x1024"
      },
      isFavorite: true,
      downloadCount: 5
    },
    {
      id: "2", 
      type: "video",
      prompt: "A butterfly flying over a field of flowers, slow motion, cinematic, nature documentary style",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      createdAt: "2024-01-14T15:45:00Z",
      settings: {
        model: "seedance-1-0-lite-t2v",
        duration: 4,
        aspectRatio: "16:9"
      },
      isFavorite: false,
      downloadCount: 2
    },
    {
      id: "3",
      type: "image", 
      prompt: "Abstract digital art with vibrant colors and geometric shapes, modern minimalist design",
      url: "https://via.placeholder.com/400x400/8b5cf6/ffffff?text=Abstract+Art",
      createdAt: "2024-01-13T09:15:00Z",
      settings: {
        model: "dall-e-3",
        size: "768x1024"
      },
      isFavorite: true,
      downloadCount: 12
    },
    {
      id: "4",
      type: "video",
      prompt: "Ocean waves crashing on a rocky shore during golden hour, peaceful and serene",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      createdAt: "2024-01-12T14:20:00Z",
      settings: {
        model: "runway-gen-2",
        duration: 6,
        aspectRatio: "16:9"
      },
      isFavorite: false,
      downloadCount: 8
    },
    {
      id: "5",
      type: "image",
      prompt: "Cyberpunk cityscape with neon lights, futuristic architecture, night scene, rain reflections",
      url: "https://via.placeholder.com/400x400/10b981/ffffff?text=Cyberpunk+City",
      createdAt: "2024-01-11T16:30:00Z",
      settings: {
        model: "midjourney",
        size: "1024x768"
      },
      isFavorite: true,
      downloadCount: 15
    },
    {
      id: "6",
      type: "video",
      prompt: "Time-lapse of a seed growing into a sunflower, nature miracle, educational content",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      createdAt: "2024-01-10T11:00:00Z",
      settings: {
        model: "stable-video",
        duration: 8,
        aspectRatio: "9:16"
      },
      isFavorite: false,
      downloadCount: 3
    },
    {
      id: "7",
      type: "image",
      prompt: "Mystical forest with glowing mushrooms and fireflies, fantasy art style, magical atmosphere",
      url: "https://via.placeholder.com/400x400/f59e0b/ffffff?text=Mystical+Forest",
      createdAt: "2024-01-09T20:15:00Z",
      settings: {
        model: "stable-diffusion-xl",
        size: "1024x1024"
      },
      isFavorite: true,
      downloadCount: 7
    },
    {
      id: "8",
      type: "image",
      prompt: "Minimalist modern architecture, white concrete, geometric shapes, natural lighting",
      url: "https://via.placeholder.com/400x400/6b7280/ffffff?text=Modern+Architecture",
      createdAt: "2024-01-08T13:45:00Z",
      settings: {
        model: "dall-e-3",
        size: "1024x768"
      },
      isFavorite: false,
      downloadCount: 4
    }
  ]);

  /**
   * Filter and sort the history items
   */
  const filteredHistory = mockHistory
    .filter(item => {
      // Type filter
      if (filterType !== "all" && item.type !== filterType) return false;
      
      // Search filter
      if (searchQuery && !item.prompt.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Favorites filter
      if (showFavoritesOnly && !item.isFavorite) return false;
      
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
        case "popular":
          return b.downloadCount - a.downloadCount;
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
   * Toggle favorite status
   */
  const toggleFavorite = (id: string): void => {
    setMockHistory(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  /**
   * Handle item deletion
   */
  const handleDelete = (id: string): void => {
    setMockHistory(prev => prev.filter(item => item.id !== id));
    console.log("Delete item:", id);
  };

  /**
   * Handle download
   */
  const handleDownload = (item: GenerationItem): void => {
    // Increment download count
    setMockHistory(prev =>
      prev.map(historyItem =>
        historyItem.id === item.id
          ? { ...historyItem, downloadCount: historyItem.downloadCount + 1 }
          : historyItem
      )
    );
    console.log("Download item:", item);
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
                      All ({mockHistory.length})
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
                      Images ({mockHistory.filter(item => item.type === "image").length})
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
                      Videos ({mockHistory.filter(item => item.type === "video").length})
                    </button>
                  </div>
                </div>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFavoritesOnly}
                    onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-sm text-gray-700">Favorites only</span>
                </label>
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-4">
                <Calendar size={20} className="text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "popular")}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Downloaded</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredHistory.length} of {mockHistory.length} generations
            {searchQuery && ` matching "${searchQuery}"`}
            {showFavoritesOnly && " (favorites only)"}
          </p>
        </div>

        {/* History Grid */}
        {filteredHistory.length === 0 ? (
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
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt="Generated content"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full">
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
                  
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                  >
                    <Star
                      size={16}
                      className={item.isFavorite ? "text-yellow-500 fill-current" : "text-gray-400"}
                    />
                  </button>

                  {/* Download Count */}
                  {item.downloadCount > 0 && (
                    <div className="absolute bottom-2 left-2 flex items-center space-x-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      <Eye size={12} />
                      <span>{item.downloadCount}</span>
                    </div>
                  )}
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
                      onClick={() => handleDownload(item)}
                      className="flex-1 btn-secondary text-sm flex items-center justify-center"
                    >
                      <Download size={14} className="mr-1" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
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
    </div>
  );
}; 