/**
 * Login Page
 * User authentication page with login and signup tabs
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Login from "../components/User/Login";
import Signup from "../components/User/Signup";

type AuthMode = "login" | "signup";

interface LoginPageProps {
  onAuthSuccess?: () => void;
}

/**
 * Authentication page with login and signup functionality
 */
const LoginPage: React.FC<LoginPageProps> = ({ onAuthSuccess }) => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  /**
   * Redirect authenticated users
   */
  useEffect(() => {
    if (user && !loading) {
      onAuthSuccess?.();
    }
  }, [user, loading, onAuthSuccess]);

  /**
   * Handle switching between login and signup
   */
  const handleModeSwitch = (mode: AuthMode): void => {
    setAuthMode(mode);
  };

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = (): void => {
    onAuthSuccess?.();
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is already authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">MA</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ModelArk</h1>
          <p className="text-lg text-gray-600">AI-Powered Media Generation</p>
        </div>

        {/* Authentication Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => handleModeSwitch("login")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                authMode === "login"
                  ? "text-primary-600 bg-primary-50 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleModeSwitch("signup")}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                authMode === "signup"
                  ? "text-primary-600 bg-primary-50 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {authMode === "login" ? (
              <Login
                onSwitchToSignup={() => handleModeSwitch("signup")}
                onLoginSuccess={handleAuthSuccess}
              />
            ) : (
              <Signup
                onSwitchToLogin={() => handleModeSwitch("login")}
                onSignupSuccess={() => handleModeSwitch("login")}
              />
            )}
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-blue-600 font-semibold">AI</span>
              </div>
              <span>AI Generation</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-green-600 font-semibold">🔒</span>
              </div>
              <span>Secure</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-purple-600 font-semibold">⚡</span>
              </div>
              <span>Fast</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            By using ModelArk, you agree to our{" "}
            <button 
              type="button"
              onClick={() => console.log("Terms of Service clicked")}
              className="text-primary-600 hover:text-primary-700 underline focus:outline-none"
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button 
              type="button"
              onClick={() => console.log("Privacy Policy clicked")}
              className="text-primary-600 hover:text-primary-700 underline focus:outline-none"
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 