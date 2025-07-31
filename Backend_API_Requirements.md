# Backend API Requirements for ModelArk Media Generation App

## Overview

This document outlines the API endpoints that need to be implemented in the backend server to handle **AI-powered image and video generation only**. 

**Important Architecture Note:**
- **Backend Server**: Handles only AI API calls (ByteDance ModelArk, video generation, etc.)
- **Frontend**: Continues to use Supabase directly for all data operations (authentication, database queries, file storage URLs)
- **Data Flow**: Frontend fetches images/videos from Supabase using existing URLs, backend only generates new content

The frontend has been updated to make HTTP requests to the backend for AI generation, while keeping all existing Supabase operations intact.

## Environment Variables

The frontend will use the following environment variable to connect to your backend:

```
REACT_APP_API_BASE_URL=http://localhost:3001
```

**Note**: Change the URL to your production server when deploying.

## Required API Endpoints

### 1. Image Generation API

#### POST `/api/images/generate`

Generates images using AI models (currently ByteDance ModelArk API).

**Request Body:**
```json
{
  "prompt": "A beautiful sunset over mountains",
  "model": "seedream-3-0-t2i-250415",
  "size": "1024x1024",
  "userId": "user-uuid-here"
}
```

**Response:**
```json
{
  "promptId": "prompt-uuid",
  "images": [
    {
      "id": "image-uuid",
      "url": "https://original-ai-api-url.jpg",
      "bucketUrl": "https://your-storage-bucket-url.jpg",
      "size": "1024x1024"
    }
  ]
}
```

**What this endpoint should do:**
1. Create a prompt record in the database (prompts table)
2. Call ByteDance ModelArk API using OpenAI SDK:
   ```javascript
   const openai = new OpenAI({
     apiKey: process.env.ARK_API_KEY,
     baseURL: 'https://ark.ap-southeast.bytepluses.com/api/v3'
   });
   
   const response = await openai.images.generate({
     model,
     prompt,
     size,
     response_format: "url"
   });
   ```
3. Download images from AI API URLs
4. Upload images to your storage (Supabase/S3/etc.)
5. Save image records to database (images table)
6. Return the structured response

**Note**: The frontend will continue to fetch stored images directly from Supabase using the existing ImageContext.

---

#### POST `/api/images/test`

Tests the AI API connection for debugging purposes.

**Request Body:**
```json
{
  "prompt": "A simple test image"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Raw API response from ModelArk
  }
}
```

**Or on error:**
```json
{
  "success": false,
  "error": "API Error: Authentication failed (Status: 401)"
}
```

---

#### GET `/api/images/models`

Returns available AI models for image generation.

**Response:**
```json
{
  "models": [
    "seedream-3-0-t2i-250415",
    "other-model-if-available"
  ]
}
```

### 2. Video Generation API

#### POST `/api/videos/generate`

Generates videos using AI models (e.g., ByteDance Seedance).

**Request:** Multipart form data
- `prompt` (string): Text description of the video
- `model` (string): AI model to use (e.g., "seedance-1-0-lite-t2v")
- `duration` (string): Video duration in seconds (e.g., "4")
- `aspectRatio` (string): Aspect ratio (e.g., "16:9", "9:16", "1:1")
- `image` (file, optional): Starting image for image-to-video generation

**Response:**
```json
{
  "video_url": "https://your-storage-bucket-url/generated-video.mp4",
  "duration": 4,
  "aspectRatio": "16:9"
}
```

**What this endpoint should do:**
1. Handle multipart form data
2. Save uploaded image (if provided) temporarily  
3. Create prompt record in database
4. Call video generation AI API (ByteDance Seedance or similar)
5. Handle video processing (may be asynchronous)
6. Store generated video in your storage
7. Save video record to database
8. Return video URL

**Note**: The frontend will continue to fetch stored videos directly from Supabase using the existing VideoContext.

## Database Schema Reference

**Important**: The backend will **write** to these tables during AI generation, but the frontend will continue to **read** directly from Supabase using existing contexts.

Based on the existing frontend code, you'll need access to these database tables:

### `prompts` table
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key to users)
- prompt (TEXT)
- model_used (VARCHAR)
- type (VARCHAR) -- "image" or "video"
- size (VARCHAR) -- for images
- language (VARCHAR) -- default "en"
- created_at (TIMESTAMP)
```

### `images` table
```sql
- id (UUID, primary key)
- prompt_id (UUID, foreign key to prompts)
- url (TEXT) -- original AI API URL
- size (VARCHAR)
- file_size (BIGINT)
- mime_type (VARCHAR)
- created_at (TIMESTAMP)
```

### `videos` table (you may need to create this)
```sql
- id (UUID, primary key)
- prompt_id (UUID, foreign key to prompts)
- url (TEXT) -- original AI API URL
- duration (INTEGER)
- aspect_ratio (VARCHAR)
- file_size (BIGINT)
- mime_type (VARCHAR)
- created_at (TIMESTAMP)
```

## Current AI API Integration Details

### ByteDance ModelArk (Image Generation)
- **API Key**: Required (ARK_API_KEY environment variable)
- **Base URL**: `https://ark.ap-southeast.bytepluses.com/api/v3`
- **SDK**: OpenAI SDK (compatible)
- **Models**: Currently using "seedream-3-0-t2i-250415"
- **Sizes**: 1024x1024, 512x512, 1536x1024, 1024x1536

### Video Generation
- **Models**: "seedance-1-0-lite-t2v", "runway-gen-2", "stable-video"
- **Duration**: 2-10 seconds
- **Aspect Ratios**: 16:9, 9:16, 1:1

## Error Handling

The frontend expects structured error responses:

```json
{
  "error": "Descriptive error message here"
}
```

Common error types to handle:
- Authentication errors (invalid API keys)
- Rate limiting errors
- Network connection errors
- Invalid request parameters
- AI API service errors

## Security Considerations

1. **API Key Protection**: Never expose AI API keys to the frontend
2. **User Authentication**: Verify user identity for all endpoints
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Input Validation**: Validate all inputs (prompts, file uploads, etc.)
5. **File Upload Security**: Scan uploaded files, limit file sizes
6. **Storage Security**: Ensure proper access controls on stored media

## Performance Considerations

1. **Async Processing**: Video generation may take time - consider job queues
2. **Progress Updates**: Implement WebSocket or polling for progress updates
3. **Caching**: Cache available models and other static data
4. **CDN**: Use CDN for serving generated media files
5. **Database Optimization**: Index frequently queried fields

## Dependencies Needed

Based on the removed frontend code:

```json
{
  "openai": "^4.x.x",
  "multer": "^1.x.x",
  "@supabase/supabase-js": "^2.x.x"
}
```

Or equivalent packages for your preferred storage solution.

## Example Implementation Structure

```
backend/
├── routes/
│   ├── images.js
│   └── videos.js
├── services/
│   ├── aiService.js
│   └── storageService.js
├── middleware/
│   ├── auth.js
│   └── upload.js
└── models/
    ├── Prompt.js
    ├── Image.js
    └── Video.js
```

This structure separates concerns and makes the codebase maintainable.

## Frontend vs Backend Responsibilities

### Frontend (React + Supabase)
✅ **Keeps doing:**
- User authentication (Supabase Auth)
- Data fetching (images, videos, prompts) via Supabase client
- Image/video rendering using existing URLs from database
- User interface and interactions
- Local state management

### Backend (Node.js/Python + AI APIs)
✅ **New responsibilities:**
- AI image generation (ByteDance ModelArk API)
- AI video generation (Seedance/other video APIs)
- Image/video processing and storage
- Writing generated content to database
- API key management and security

### Data Flow
1. **User generates content**: Frontend → Backend API
2. **AI processing**: Backend → AI APIs → Storage → Database
3. **User views content**: Frontend → Supabase (direct) → Display
4. **User manages content**: Frontend → Supabase (direct)

This keeps the existing Supabase integration intact while adding secure AI processing capabilities.