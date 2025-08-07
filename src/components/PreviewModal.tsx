/**
 * PreviewModal Component
 * A unified modal for previewing both images and videos with download functionality
 */

import React, { useRef, useEffect } from "react";
import { X, Download, Play, Pause, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";

export interface PreviewItem {
  id: string;
  type: "image" | "video";
  url: string;
  prompt: string;
  createdAt?: string;
  settings?: {
    model?: string;
    size?: string;
    duration?: number;
    aspectRatio?: string;
  };
}

interface PreviewModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** The item to preview */
  item: PreviewItem | null;
  /** Function to handle download */
  onDownload: (item: PreviewItem) => void;
}

/**
 * PreviewModal Component
 * Displays a modal for previewing images or videos with controls and download option
 */
export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  item,
  onDownload
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [isMuted, setIsMuted] = React.useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const [currentTime, setCurrentTime] = React.useState<number>(0);
  const [duration, setDuration] = React.useState<number>(0);

  // Reset state when modal opens/closes or item changes
  useEffect(() => {
    if (isOpen && item) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [isOpen, item]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  /**
   * Handle video play/pause
   */
  const togglePlay = (): void => {
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
   * Handle video mute/unmute
   */
  const toggleMute = (): void => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  /**
   * Handle fullscreen toggle
   */
  const toggleFullscreen = (): void => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  /**
   * Handle video time update
   */
  const handleTimeUpdate = (): void => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  /**
   * Handle video metadata loaded
   */
  const handleLoadedMetadata = (): void => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  /**
   * Handle seek
   */
  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const time = parseFloat(event.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  /**
   * Format time for display
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  /**
   * Handle download button click
   */
  const handleDownload = (): void => {
    if (item) {
      onDownload(item);
    }
  };

  if (!isOpen || !item) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                item.type === "image" 
                  ? "bg-blue-100 text-blue-800" 
                  : "bg-purple-100 text-purple-800"
              }`}>
                {item.type.toUpperCase()}
              </span>
              {item.settings?.model && (
                <span className="text-sm text-gray-500">
                  {item.settings.model}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="btn-secondary text-sm flex items-center"
            >
              <Download size={16} className="mr-1" />
              Download
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Media Content */}
        <div className="relative bg-black">
          {item.type === "image" ? (
            <img
              src={item.url}
              alt={item.prompt}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                src={item.url}
                className="w-full h-auto max-h-[70vh] object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                controls={false}
              />
              
              {/* Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                {/* Progress Bar */}
                <div className="mb-3">
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={togglePlay}
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    
                    <button
                      onClick={toggleMute}
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    
                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Details */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            <p className="text-sm text-gray-700 line-clamp-3">
              <span className="font-medium">Prompt:</span> {item.prompt}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              {item.createdAt && (
                <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
              )}
              {item.settings?.size && (
                <span>Size: {item.settings.size}</span>
              )}
              {item.settings?.duration && (
                <span>Duration: {item.settings.duration}s</span>
              )}
              {item.settings?.aspectRatio && (
                <span>Aspect Ratio: {item.settings.aspectRatio}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};