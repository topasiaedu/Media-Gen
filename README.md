# 🚀 ModelArk Full-Stack App

A modern React TypeScript application for AI-powered image and video generation using BytePlus ModelArk API with Supabase backend.

## ✨ Features

- **🎨 AI Image Generation**: Generate high-quality images using ModelArk's advanced AI models
- **🎬 Video Generation**: Create videos from text prompts (coming soon)
- **☁️ Cloud Storage**: Automatic image upload to Supabase storage buckets
- **👤 User Authentication**: Secure user management with Supabase Auth
- **📊 Usage Tracking**: Track prompts, credits, and generation history
- **📱 Responsive Design**: Mobile-first design with Tailwind CSS
- **🔒 Secure**: Row Level Security (RLS) policies for data protection

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Storage)
- **AI API**: BytePlus ModelArk
- **State Management**: React Context API
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel (Frontend), Supabase Cloud (Backend)

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Supabase account
- BytePlus ModelArk API key

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Media-Gen
npm install
```

### 2. Environment Setup

1. Copy the environment template:
   ```bash
   cp env.example .env
   ```

2. Fill in your environment variables in `.env`:
   ```env
   # ModelArk API
   REACT_APP_ARK_API_KEY=your_ark_api_key_here
   
   # Supabase
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com/)
2. Run the database schema:
   ```sql
   -- Copy and paste the contents of src/db/schema.sql into your Supabase SQL editor
   ```
3. Set up storage bucket:
   ```sql
   -- Copy and paste the contents of src/db/storage-setup.sql into your Supabase SQL editor
   ```

### 4. Get API Keys

#### ModelArk API Key
1. Sign up at [BytePlus Console](https://console.byteplus.com/)
2. Create a new project
3. Generate an API key
4. Add it to your `.env` file

#### Supabase Keys
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon/public key
4. Add them to your `.env` file

### 5. Run the Application

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📖 Usage

### Image Generation

```typescript
import { useImageGeneration } from './hooks/useImageGeneration';

function ImageGenerator() {
  const { generateImage, loading, error, progress } = useImageGeneration();

  const handleGenerate = async () => {
    const result = await generateImage({
      prompt: "A beautiful sunset over mountains",
      model: "seedream-3-0-t2i-250415",
      size: "1024x1024",
      guidance_scale: 3,
      watermark: true
    });
    
    if (result) {
      console.log('Generated images:', result.images);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? `${progress.message}` : 'Generate Image'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### Available Models

- `seedream-3-0-t2i-250415` - High-quality text-to-image generation

### Supported Image Sizes

- `512x512` - Square, small
- `768x768` - Square, medium  
- `1024x1024` - Square, large
- `1024x768` - Landscape
- `768x1024` - Portrait

## 🏗️ Project Structure

```
src/
├── api/               # API integration modules
│   ├── imageApi.ts    # ModelArk image generation API
│   ├── videoApi.ts    # ModelArk video generation API
│   └── authApi.ts     # Authentication API calls
├── components/        # Reusable React components
│   ├── Image/         # Image-related components
│   ├── Video/         # Video-related components
│   ├── Prompt/        # Prompt input components
│   └── User/          # User management components
├── contexts/          # React Context providers
│   ├── AuthContext.tsx
│   ├── ImageContext.tsx
│   └── PromptContext.tsx
├── hooks/             # Custom React hooks
│   ├── useAuth.ts
│   ├── useImageGeneration.ts
│   └── usePromptHistory.ts
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── db/                # Database schemas and setup
    ├── schema.sql
    └── storage-setup.sql
```

## 🔧 Development

### Available Scripts

- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

### Code Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **Formatting**: Use double quotes for strings
- **Comments**: JSDoc headers for all functions
- **Error Handling**: Comprehensive error checking

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Supabase)

- Database and storage are managed by Supabase Cloud
- Set up production environment variables
- Configure custom domain if needed

## 🔒 Security

- **Row Level Security**: All database tables protected with RLS
- **API Keys**: Never commit API keys to version control
- **CORS**: Properly configured for your domain
- **Authentication**: JWT-based secure authentication

## 📊 Monitoring

- **Error Tracking**: Console logging for development
- **Usage Analytics**: Track API usage and costs
- **Performance**: Monitor image generation times

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify your ModelArk API key is correct
   - Check if your account has sufficient credits

2. **Supabase Connection Failed**
   - Verify your Supabase URL and anon key
   - Check if RLS policies are properly configured

3. **Storage Upload Failed**
   - Ensure the 'images' bucket exists
   - Check storage policies allow authenticated uploads

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Review the [Project Plan](🚀%20ModelArk%20Full-Stack%20App_%20Finalized%20Project%20Plan.md)
- Contact support for API-related issues

---

Made with ❤️ using React, TypeScript, and ModelArk AI
