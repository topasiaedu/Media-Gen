/**
 * Profile Page
 * User profile and settings page
 */

import React, { useState } from "react";
import { User, Settings, Crown, Download, Image, Video, BarChart3, Mail, Key, Bell, Palette, Globe } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
  subscription: "free" | "pro" | "enterprise";
  credits: number;
  totalGenerations: number;
  totalImages: number;
  totalVideos: number;
}

interface UserSettings {
  emailNotifications: boolean;
  autoSave: boolean;
  defaultImageSize: string;
  defaultVideoAspectRatio: string;
  theme: "light" | "dark" | "auto";
  language: string;
}

/**
 * Profile Page Component
 * User profile management with settings and statistics
 */
export const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "billing">("profile");
  
  // Mock user data
  const [userProfile] = useState<UserProfile>({
    id: "user-123",
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    avatar: "https://via.placeholder.com/150x150/3b82f6/ffffff?text=AJ",
    joinDate: "2024-01-01T00:00:00Z",
    subscription: "pro",
    credits: 850,
    totalGenerations: 127,
    totalImages: 89,
    totalVideos: 38
  });

  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    autoSave: true,
    defaultImageSize: "1024x1024",
    defaultVideoAspectRatio: "16:9",
    theme: "light",
    language: "en"
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>(userProfile.name);

  /**
   * Handle profile update
   */
  const handleSaveProfile = (): void => {
    // TODO: Implement profile update logic
    setIsEditing(false);
    console.log("Profile updated:", { name: editedName });
  };

  /**
   * Handle settings update
   */
  const handleSettingsChange = (key: keyof UserSettings, value: any): void => {
    setSettings(prev => ({ ...prev, [key]: value }));
    console.log("Setting updated:", key, value);
  };

  /**
   * Format join date
   */
  const formatJoinDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  /**
   * Get subscription badge
   */
  const getSubscriptionBadge = () => {
    const badges = {
      free: { label: "Free", color: "bg-gray-500", icon: User },
      pro: { label: "Pro", color: "bg-primary-600", icon: Crown },
      enterprise: { label: "Enterprise", color: "bg-purple-600", icon: Crown }
    };
    
    const badge = badges[userProfile.subscription];
    const IconComponent = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${badge.color}`}>
        <IconComponent size={14} className="mr-1" />
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-lg text-gray-600">Manage your account and preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="card mb-8">
          <div className="flex space-x-8 border-b border-gray-200">
            {[
              { id: "profile", label: "Profile", icon: User },
              { id: "settings", label: "Settings", icon: Settings },
              { id: "billing", label: "Billing", icon: Crown }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <IconComponent size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
                
                <div className="flex items-start space-x-6 mb-6">
                  <img
                    src={userProfile.avatar}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="text-2xl font-bold text-gray-900 border-b border-primary-300 focus:outline-none focus:border-primary-500"
                        />
                      ) : (
                        <h3 className="text-2xl font-bold text-gray-900">{userProfile.name}</h3>
                      )}
                      {getSubscriptionBadge()}
                    </div>
                    <p className="text-gray-600 mb-2">{userProfile.email}</p>
                    <p className="text-sm text-gray-500">Member since {formatJoinDate(userProfile.joinDate)}</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  {isEditing ? (
                    <>
                      <button onClick={handleSaveProfile} className="btn-primary">
                        Save Changes
                      </button>
                      <button onClick={() => setIsEditing(false)} className="btn-secondary">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="btn-primary">
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="card mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Usage Statistics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <BarChart3 className="mx-auto mb-2 text-blue-600" size={32} />
                    <div className="text-2xl font-bold text-blue-600">{userProfile.totalGenerations}</div>
                    <div className="text-sm text-gray-600">Total Generations</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Image className="mx-auto mb-2 text-green-600" size={32} />
                    <div className="text-2xl font-bold text-green-600">{userProfile.totalImages}</div>
                    <div className="text-sm text-gray-600">Images Created</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Video className="mx-auto mb-2 text-purple-600" size={32} />
                    <div className="text-2xl font-bold text-purple-600">{userProfile.totalVideos}</div>
                    <div className="text-sm text-gray-600">Videos Generated</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Credits */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Credits</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">{userProfile.credits}</div>
                  <div className="text-sm text-gray-600 mb-4">Credits remaining</div>
                  <button className="btn-primary w-full">Buy More Credits</button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3">
                    <Download className="text-gray-400" size={20} />
                    <span>Download All Data</span>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3">
                    <Key className="text-gray-400" size={20} />
                    <span>Change Password</span>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3">
                    <Mail className="text-gray-400" size={20} />
                    <span>Update Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>
            
            <div className="space-y-6">
              {/* Notifications */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Bell className="text-gray-400" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive updates about your generations</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingsChange("emailNotifications", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Auto Save */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Download className="text-gray-400" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">Auto Save</p>
                    <p className="text-sm text-gray-500">Automatically save generated content</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingsChange("autoSave", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Default Image Size */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Image className="text-gray-400" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">Default Image Size</p>
                    <p className="text-sm text-gray-500">Default resolution for new images</p>
                  </div>
                </div>
                <select
                  value={settings.defaultImageSize}
                  onChange={(e) => handleSettingsChange("defaultImageSize", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="512x512">512x512</option>
                  <option value="1024x1024">1024x1024</option>
                  <option value="1024x768">1024x768</option>
                  <option value="768x1024">768x1024</option>
                </select>
              </div>

              {/* Theme */}
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Palette className="text-gray-400" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">Theme</p>
                    <p className="text-sm text-gray-500">Choose your preferred theme</p>
                  </div>
                </div>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingsChange("theme", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center space-x-3">
                  <Globe className="text-gray-400" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">Language</p>
                    <p className="text-sm text-gray-500">Interface language</p>
                  </div>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingsChange("language", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Plan */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Plan</h2>
              
              <div className="text-center p-6 bg-primary-50 rounded-lg mb-6">
                <Crown className="mx-auto mb-4 text-primary-600" size={48} />
                <h3 className="text-2xl font-bold text-primary-600 mb-2">Pro Plan</h3>
                <p className="text-gray-600 mb-4">Perfect for professionals</p>
                <div className="text-3xl font-bold text-gray-900">$19<span className="text-lg text-gray-500">/month</span></div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">1,000 credits per month</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Priority generation queue</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Advanced AI models</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Commercial usage rights</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="btn-secondary w-full mb-3">Change Plan</button>
                <button className="w-full text-red-600 hover:text-red-800 text-sm">Cancel Subscription</button>
              </div>
            </div>

            {/* Billing History */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing History</h2>
              
              <div className="space-y-4">
                {[
                  { date: "2024-01-15", amount: "$19.00", status: "Paid", invoice: "INV-001" },
                  { date: "2023-12-15", amount: "$19.00", status: "Paid", invoice: "INV-002" },
                  { date: "2023-11-15", amount: "$19.00", status: "Paid", invoice: "INV-003" }
                ].map((bill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{bill.invoice}</p>
                      <p className="text-sm text-gray-500">{bill.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{bill.amount}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {bill.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="btn-secondary w-full mt-6">View All Invoices</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 