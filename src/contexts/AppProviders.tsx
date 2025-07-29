/**
 * App Providers
 * Combines all context providers for the application
 * Ensures proper nesting order and dependency management
 */

import React, { ReactNode } from "react";
import { AuthProvider } from "./AuthContext";
import { UserProvider } from "./UserContext";
import { PromptProvider } from "./PromptContext";
import { ImageProvider } from "./ImageContext";
import { VideoProvider } from "./VideoContext";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Combines all context providers in the correct order
 * Auth must be first, then specific table contexts
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <PromptProvider>
          <ImageProvider>
            <VideoProvider>
              {children}
            </VideoProvider>
          </ImageProvider>
        </PromptProvider>
      </UserProvider>
    </AuthProvider>
  );
}; 