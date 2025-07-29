import React, { useState } from "react";
import { Image, Video, Clock, User, LogOut, Settings, ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onAuthRequired?: () => void;
}

/**
 * Navigation component for the ModelArk app
 * Provides navigation between different sections of the app with authentication state
 */
export const Navigation: React.FC<NavigationProps> = ({ 
  activeSection, 
  onSectionChange,
  onAuthRequired
}) => {
  const { user, signOut, loading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: Image,
      description: "Generate images and videos",
      requiresAuth: false
    },
    {
      id: "image",
      label: "Images",
      icon: Image,
      description: "AI Image Generation",
      requiresAuth: true
    },
    {
      id: "video",
      label: "Videos", 
      icon: Video,
      description: "AI Video Generation",
      requiresAuth: true
    },
    {
      id: "history",
      label: "History",
      icon: Clock,
      description: "View past generations",
      requiresAuth: true
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      description: "User settings",
      requiresAuth: true
    }
  ];

  /**
   * Handle navigation item click
   */
  const handleNavClick = (itemId: string, requiresAuth: boolean): void => {
    if (requiresAuth && !user) {
      onAuthRequired?.();
      return;
    }
    onSectionChange(itemId);
    setShowMobileMenu(false);
  };

  /**
   * Handle user logout
   */
  const handleLogout = async (): Promise<void> => {
    try {
      await signOut();
      setShowUserMenu(false);
      onSectionChange("home");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /**
   * Toggle user menu
   */
  const toggleUserMenu = (): void => {
    setShowUserMenu(prev => !prev);
  };

  /**
   * Toggle mobile menu
   */
  const toggleMobileMenu = (): void => {
    setShowMobileMenu(prev => !prev);
  };

  /**
   * Get user display name
   */
  const getUserDisplayName = (): string => {
    if (!user) return "";
    return user.email.split("@")[0];
  };

  /**
   * Get user avatar placeholder
   */
  const getUserAvatar = (): string => {
    if (!user) return "";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => onSectionChange("home")}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-white">MA</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-primary-600">
                    ModelArk
                  </h1>
                  <p className="text-xs text-gray-500">Media Generator</p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.id;
              const isDisabled = item.requiresAuth && !user;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.requiresAuth)}
                  disabled={loading}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-primary-600 bg-primary-50"
                      : isDisabled
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                  } disabled:opacity-50`}
                  title={isDisabled ? "Sign in required" : item.description}
                >
                  <IconComponent size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              /* Authenticated User Menu */
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {getUserAvatar()}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          handleNavClick("profile", true);
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                      >
                        <Settings size={16} />
                        <span>Profile & Settings</span>
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        disabled={loading}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 disabled:opacity-50"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Unauthenticated State */
              <button
                onClick={() => onAuthRequired?.()}
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Loading..." : "Sign In"}
              </button>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-600 hover:text-primary-600 focus:outline-none focus:text-primary-600 p-2"
                aria-label="Toggle menu"
              >
                {showMobileMenu ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeSection === item.id;
                const isDisabled = item.requiresAuth && !user;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id, item.requiresAuth)}
                    disabled={loading}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      isActive
                        ? "text-primary-600 bg-primary-50"
                        : isDisabled
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                    } disabled:opacity-50`}
                  >
                    <IconComponent size={20} />
                    <div>
                      <span className="font-medium">{item.label}</span>
                      <p className="text-xs text-gray-500">{item.description}</p>
                      {isDisabled && (
                        <p className="text-xs text-orange-500">Sign in required</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mobile User Section */}
            {user && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 px-4 py-2 mb-2">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {getUserAvatar()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    handleNavClick("profile", true);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <Settings size={18} />
                  <span>Profile & Settings</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}; 