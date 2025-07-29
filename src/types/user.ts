/**
 * User Types
 * TypeScript interfaces for user-related functionality
 */

/**
 * Basic user profile interface matching Supabase auth user
 */
export interface UserProfile {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Extended user profile with additional metadata
 */
export interface ExtendedUserProfile extends UserProfile {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  preferences?: UserPreferences;
  subscription?: UserSubscription;
  credits?: number;
  lastLoginAt?: string;
}

/**
 * User preferences and settings
 */
export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  autoSave: boolean;
  defaultImageSize: string;
  defaultVideoAspectRatio: string;
  publicProfile: boolean;
}

/**
 * User subscription information
 */
export interface UserSubscription {
  plan: "free" | "pro" | "enterprise";
  status: "active" | "inactive" | "cancelled" | "past_due";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  billingInterval: "monthly" | "yearly";
  priceId?: string;
  customerId?: string;
}

/**
 * User statistics and usage data
 */
export interface UserStats {
  totalGenerations: number;
  totalImages: number;
  totalVideos: number;
  creditsUsed: number;
  creditsRemaining: number;
  lastGeneratedAt?: string;
  favoriteModels: string[];
  popularPrompts: string[];
}

/**
 * Authentication form data interfaces
 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  agreeToTerms: boolean;
  subscribeToNewsletter?: boolean;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateProfileFormData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  website?: string;
  location?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

/**
 * Authentication state interface
 */
export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

/**
 * API response interfaces for user operations
 */
export interface UserApiResponse {
  success: boolean;
  data?: ExtendedUserProfile;
  error?: string;
  message?: string;
}

export interface UsersListResponse {
  success: boolean;
  data?: ExtendedUserProfile[];
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * User activity log interface
 */
export interface UserActivity {
  id: string;
  userId: string;
  action: "login" | "logout" | "signup" | "password_change" | "profile_update" | "generation_created" | "subscription_changed";
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

/**
 * User notification interface
 */
export interface UserNotification {
  id: string;
  userId: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: string;
  createdAt: string;
}

/**
 * User role and permission interfaces
 */
export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface UserPermission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
} 