import React, { useState } from "react";
import { AppProviders } from "./contexts/AppProviders";
import { Navigation } from "./components/Layout/Navigation";
import { Home } from "./pages/Home";
import { ImageGenerationPage } from "./pages/ImageGenerationPage";
import { VideoGenerationPage } from "./pages/VideoGenerationPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ProfilePage } from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./contexts/AuthContext";
import "./App.css";

/**
 * Main App Component
 * Handles routing, authentication state, and navigation between different sections
 */
function AppContent() {
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState<string>("home");
  const [showLoginPage, setShowLoginPage] = useState<boolean>(false);

  /**
   * Handle section navigation
   */
  const handleSectionChange = (section: string): void => {
    setActiveSection(section);
    setShowLoginPage(false);
  };

  /**
   * Handle authentication requirement
   */
  const handleAuthRequired = (): void => {
    setShowLoginPage(true);
  };

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = (): void => {
    setShowLoginPage(false);
    // Redirect to the section they were trying to access, or profile for new users
    if (activeSection === "home") {
      setActiveSection("profile");
    }
  };

  /**
   * Render the active section content
   */
  const renderActiveSection = (): React.ReactNode => {
    // Show loading state while authentication is being checked
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading ModelArk</h2>
            <p className="text-gray-600">Please wait while we set things up...</p>
          </div>
        </div>
      );
    }

    // Show login page if requested or if accessing protected route without authentication
    if (showLoginPage || (needsAuth(activeSection) && !user)) {
      return <LoginPage onAuthSuccess={handleAuthSuccess} />;
    }

    // Render the requested section
    switch (activeSection) {
      case "home":
        return <Home onNavigate={handleSectionChange} />;
      case "image":
        return user ? <ImageGenerationPage /> : <Home onNavigate={handleSectionChange} />;
      case "video":
        return user ? <VideoGenerationPage /> : <Home onNavigate={handleSectionChange} />;
      case "history":
        return user ? <HistoryPage /> : <Home onNavigate={handleSectionChange} />;
      case "profile":
        return user ? <ProfilePage /> : <Home onNavigate={handleSectionChange} />;
      default:
        return <Home onNavigate={handleSectionChange} />;
    }
  };

  /**
   * Check if a section requires authentication
   */
  const needsAuth = (section: string): boolean => {
    const authRequiredSections = ["image", "video", "history", "profile"];
    return authRequiredSections.includes(section);
  };

  // Don't show navigation on login page
  const shouldShowNavigation = !showLoginPage && !(needsAuth(activeSection) && !user);

  return (
    <div className="min-h-screen bg-gray-50">
      {shouldShowNavigation && (
        <Navigation 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange}
          onAuthRequired={handleAuthRequired}
        />
      )}
      <main>
        {renderActiveSection()}
      </main>
    </div>
  );
}

/**
 * Main App wrapper with providers
 */
function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

export default App;
