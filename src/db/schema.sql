-- ModelArk App Database Schema
-- Run this script in your Supabase SQL editor to create all tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE prompt_type AS ENUM ('image', 'video');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE prompt_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE video_status AS ENUM ('queued', 'running', 'succeeded', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    subscription_tier subscription_tier DEFAULT 'free' NOT NULL,
    credits_remaining INTEGER DEFAULT 100 NOT NULL CHECK (credits_remaining >= 0)
);

-- Prompts table
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    prompt TEXT NOT NULL CHECK (length(prompt) > 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    model_used TEXT NOT NULL,
    type prompt_type NOT NULL,
    size TEXT,
    guidance_scale NUMERIC CHECK (guidance_scale > 0),
    language TEXT DEFAULT 'en' NOT NULL,
    status prompt_status DEFAULT 'pending' NOT NULL
);

-- Images table
CREATE TABLE IF NOT EXISTS public.images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    size TEXT NOT NULL,
    b64 TEXT, -- Base64 encoded image data (optional)
    file_size INTEGER CHECK (file_size > 0),
    mime_type TEXT DEFAULT 'image/png'
);

-- Videos table
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
    url TEXT,
    status video_status DEFAULT 'queued' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    duration INTEGER CHECK (duration > 0), -- Duration in seconds
    aspect_ratio TEXT, -- e.g., "16:9", "4:3", "1:1"
    file_size INTEGER CHECK (file_size > 0),
    mime_type TEXT DEFAULT 'video/mp4',
    task_id TEXT, -- External API task ID for tracking
    error_message TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON public.prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON public.prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_type ON public.prompts(type);
CREATE INDEX IF NOT EXISTS idx_prompts_status ON public.prompts(status);

CREATE INDEX IF NOT EXISTS idx_images_prompt_id ON public.images(prompt_id);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON public.images(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_videos_prompt_id ON public.videos(prompt_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_status ON public.videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_task_id ON public.videos(task_id) WHERE task_id IS NOT NULL;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON public.prompts 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON public.images 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Prompts policies
CREATE POLICY "Users can view own prompts" ON public.prompts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prompts" ON public.prompts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompts" ON public.prompts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompts" ON public.prompts
    FOR DELETE USING (auth.uid() = user_id);

-- Images policies
CREATE POLICY "Users can view own images" ON public.images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.prompts 
            WHERE prompts.id = images.prompt_id 
            AND prompts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own images" ON public.images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.prompts 
            WHERE prompts.id = images.prompt_id 
            AND prompts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own images" ON public.images
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.prompts 
            WHERE prompts.id = images.prompt_id 
            AND prompts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own images" ON public.images
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.prompts 
            WHERE prompts.id = images.prompt_id 
            AND prompts.user_id = auth.uid()
        )
    );

-- Videos policies
CREATE POLICY "Users can view own videos" ON public.videos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.prompts 
            WHERE prompts.id = videos.prompt_id 
            AND prompts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own videos" ON public.videos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.prompts 
            WHERE prompts.id = videos.prompt_id 
            AND prompts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own videos" ON public.videos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.prompts 
            WHERE prompts.id = videos.prompt_id 
            AND prompts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own videos" ON public.videos
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.prompts 
            WHERE prompts.id = videos.prompt_id 
            AND prompts.user_id = auth.uid()
        )
    );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile when auth user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample data (optional - remove in production)
-- This is helpful for development and testing
/*
INSERT INTO public.users (id, email, first_name, last_name, subscription_tier, credits_remaining) 
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'demo@example.com', 'Demo', 'User', 'premium', 500)
ON CONFLICT (id) DO NOTHING;
*/ 