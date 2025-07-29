/**
 * Home Page
 * Main landing page with prompt input and generation options
 */

import React from "react";
import { Image, Video, Zap, Clock } from "lucide-react";

interface HomeProps {
  onNavigate: (section: string) => void;
}

/**
 * Home page component with hero section and feature overview
 * Showcases the main functionality of the ModelArk app
 */
export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: Image,
      title: "AI Image Generation",
      description: "Create stunning images from text prompts using advanced AI models",
      color: "bg-blue-500",
      action: () => onNavigate("image")
    },
    {
      icon: Video,
      title: "AI Video Generation",
      description: "Generate captivating videos from descriptions and images",
      color: "bg-purple-500",
      action: () => onNavigate("video")
    },
    {
      icon: Clock,
      title: "Generation History",
      description: "View and manage all your previous image and video generations",
      color: "bg-green-500",
      action: () => onNavigate("history")
    },
    {
      icon: Zap,
      title: "Fast Processing",
      description: "Powered by BytePlus ModelArk for lightning-fast generation",
      color: "bg-orange-500",
      action: () => {}
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered
              <span className="text-primary-600"> Media Generation</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your ideas into stunning visuals with ModelArk's advanced AI technology.
              Create images and videos from simple text descriptions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate("image")}
                className="btn-primary text-lg px-8 py-3"
              >
                Generate Images
              </button>
              <button
                onClick={() => onNavigate("video")}
                className="btn-secondary text-lg px-8 py-3"
              >
                Create Videos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to create amazing content with AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="card hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                onClick={feature.action}
              >
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">1M+</div>
              <div className="text-gray-600">Images Generated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">50K+</div>
              <div className="text-gray-600">Videos Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">99%</div>
              <div className="text-gray-600">User Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 