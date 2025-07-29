/**
 * API Types
 * TypeScript interfaces for API payloads and responses
 * Covers ModelArk API integration and internal API structures
 */

// ============================================================================
// COMMON API TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    pagination?: PaginationMeta;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ============================================================================
// MODELARK API TYPES
// ============================================================================

// Note: Image Generation now uses OpenAI client types
// These types are kept for reference but not actively used

// Video Generation API
export interface VideoGenerationRequest {
  model: string;
  content: Array<{
    type: "text" | "image_url";
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
}

export interface VideoGenerationResponse {
  id: string;
  object: "video.generation";
  created: number;
  model: string;
  status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
  video_url?: string;
  error?: {
    code: string;
    message: string;
  };
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface VideoGenerationTask {
  id: string;
  status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
  video_url?: string;
  created_at: number;
  updated_at: number;
  error?: {
    code: string;
    message: string;
  };
}

// ============================================================================
// APPLICATION API TYPES
// ============================================================================

// Authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    subscriptionTier: "free" | "premium" | "enterprise";
    creditsRemaining: number;
  };
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// Prompt Management
export interface CreatePromptRequest {
  prompt: string;
  type: "image" | "video";
  modelUsed: string;
  size?: string;
  guidanceScale?: number;
  language?: string;
}

export interface PromptWithResults {
  id: string;
  userId: string;
  prompt: string;
  type: "image" | "video";
  modelUsed: string;
  size?: string;
  guidanceScale?: number;
  language: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
  images?: Array<{
    id: string;
    url: string;
    size: string;
    createdAt: string;
  }>;
  videos?: Array<{
    id: string;
    url?: string;
    status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
    duration?: number;
    aspectRatio?: string;
    createdAt: string;
  }>;
}

// User Management
export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  subscriptionTier: "free" | "premium" | "enterprise";
  creditsRemaining: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

// History and Statistics
export interface UserHistoryRequest extends PaginationRequest {
  type?: "image" | "video";
  status?: "pending" | "processing" | "completed" | "failed";
  dateFrom?: string;
  dateTo?: string;
}

export interface UserHistoryResponse {
  prompts: PromptWithResults[];
  pagination: PaginationMeta;
  statistics: {
    totalPrompts: number;
    totalImages: number;
    totalVideos: number;
    creditsUsed: number;
  };
}

// Error Types
export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  validationErrors?: ValidationError[];
  timestamp: string;
  requestId?: string;
}

// File Upload Types
export interface FileUploadRequest {
  file: File;
  purpose: "image_reference" | "avatar" | "video_thumbnail";
}

export interface FileUploadResponse {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

// Subscription and Credits
export interface SubscriptionInfo {
  tier: "free" | "premium" | "enterprise";
  creditsRemaining: number;
  creditsTotal: number;
  resetDate?: string;
  features: string[];
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: "debit" | "credit";
  reason: string;
  createdAt: string;
  relatedPromptId?: string;
}

// WebSocket Types for Real-time Updates
export interface WebSocketMessage {
  type: "video_status_update" | "credit_update" | "error";
  data: Record<string, unknown>;
  timestamp: string;
}

export interface VideoStatusUpdate {
  videoId: string;
  status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
  url?: string;
  error?: string;
}

// Export utility type for API endpoint configurations
export interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  requiresAuth: boolean;
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
} 