-- ==============================================================================
-- MedConnect AI — Complete PostgreSQL Database Schema
-- Compatible with Supabase PostgreSQL & Row Level Security (RLS)
-- Supports persistent production deployment on Vercel + Supabase
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Specialties (Controlled Canonical Catalogue)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.specialties (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT DEFAULT 'Clinical Medicine',
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. Profiles (User Profiles & Roles)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT NOT NULL,
    title TEXT NOT NULL,
    role TEXT NOT NULL CHECK (
        role IN (
            'admin',
            'healthcare_professional',
            'medical_student',
            'researcher',
            'pharmaceutical_professional',
            'other_healthcare_professional'
        )
    ),
    institution TEXT,
    location TEXT,
    bio TEXT,
    avatar_url TEXT,
    years_of_experience INTEGER DEFAULT 0,
    qualifications TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    is_admin BOOLEAN DEFAULT FALSE,
    is_demo BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT TRUE,
    connections_count INTEGER DEFAULT 0,
    password TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. Profile Specialties (Many-to-Many)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profile_specialties (
    profile_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    specialty_id TEXT NOT NULL REFERENCES public.specialties(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (profile_id, specialty_id)
);

-- ------------------------------------------------------------------------------
-- 4. Posts (Social & Professional Feed)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.posts (
    id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    article_url TEXT,
    article_title TEXT,
    article_source TEXT,
    specialty_id TEXT REFERENCES public.specialties(id) ON DELETE SET NULL,
    topic_tags TEXT[] DEFAULT '{}',
    group_id TEXT,
    visibility TEXT DEFAULT 'everyone',
    repost_of_id TEXT,
    quote_comment TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    reposts_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. Post Likes
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id TEXT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 6. Comments
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. Case Studies (Critical Educational Resource)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.case_studies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    short_summary TEXT NOT NULL,
    educational_content TEXT NOT NULL,
    learning_objectives TEXT[] NOT NULL DEFAULT '{}',
    source_references TEXT[] DEFAULT '{}',
    author_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_title TEXT,
    author_avatar_url TEXT,
    author_institution TEXT,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    views_count INTEGER DEFAULT 0,
    bookmarks_count INTEGER DEFAULT 0,
    password_protected BOOLEAN DEFAULT FALSE,
    access_password TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    shared_with_user_ids TEXT[] DEFAULT '{}',
    visibility TEXT DEFAULT 'everyone',
    group_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. Case Study Specialties (Many-to-Many)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.case_study_specialties (
    case_study_id TEXT NOT NULL REFERENCES public.case_studies(id) ON DELETE CASCADE,
    specialty_id TEXT NOT NULL REFERENCES public.specialties(id) ON DELETE CASCADE,
    PRIMARY KEY (case_study_id, specialty_id)
);

-- ------------------------------------------------------------------------------
-- 9. Communities / Groups
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    banner_url TEXT,
    specialty_id TEXT REFERENCES public.specialties(id) ON DELETE SET NULL,
    topic_tags TEXT[] DEFAULT '{}',
    members_count INTEGER DEFAULT 0,
    created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. Group Members
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.group_members (
    group_id TEXT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

-- ------------------------------------------------------------------------------
-- 11. Connections (Professional Networking)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.connections (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    requester_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_connection_pair UNIQUE (requester_id, recipient_id),
    CONSTRAINT no_self_connection CHECK (requester_id <> recipient_id)
);

-- Ensure default UUID generation is active on existing connections tables
ALTER TABLE public.connections ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- ------------------------------------------------------------------------------
-- 12. Follows
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

-- ------------------------------------------------------------------------------
-- 13. Bookmarks
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('post', 'case_study', 'news', 'journal')),
    item_id TEXT NOT NULL,
    item_title TEXT,
    item_summary TEXT,
    item_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_bookmark UNIQUE (user_id, item_type, item_id)
);

-- ------------------------------------------------------------------------------
-- 14. Notifications
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('connection_request', 'connection_accepted', 'like', 'comment', 'system', 'case_study')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 15. AI Research Sessions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source_text TEXT NOT NULL,
    source_url TEXT,
    structured_summary JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 16. Content Reports (Moderation)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_reports (
    id TEXT PRIMARY KEY,
    reporter_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'case_study', 'user')),
    content_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------------------------
-- 17. Jobs (Career & Recruitment)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    location TEXT NOT NULL,
    specialty_id TEXT REFERENCES public.specialties(id) ON DELETE SET NULL,
    workplace_type TEXT DEFAULT 'on-site',
    employment_type TEXT DEFAULT 'full-time',
    description TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    apply_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_sample BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 18. Advertisements (Clinical Notices & Announcements)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.advertisements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    sponsor_name TEXT NOT NULL,
    sponsor_logo TEXT,
    headline TEXT NOT NULL,
    content TEXT NOT NULL,
    target_url TEXT NOT NULL,
    cta_label TEXT DEFAULT 'Learn More',
    specialty_id TEXT REFERENCES public.specialties(id) ON DELETE SET NULL,
    badge_label TEXT DEFAULT 'Sponsored Clinical Notice',
    is_active BOOLEAN DEFAULT TRUE,
    is_sample BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Indexes for High Query Performance
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_specialty ON public.posts(specialty_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_group_id ON public.posts(group_id);
CREATE INDEX IF NOT EXISTS idx_case_studies_status ON public.case_studies(status);
CREATE INDEX IF NOT EXISTS idx_case_study_specialties_specialty ON public.case_study_specialties(specialty_id);
CREATE INDEX IF NOT EXISTS idx_connections_requester ON public.connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_recipient ON public.connections(recipient_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_specialty ON public.jobs(specialty_id);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON public.jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_ads_specialty ON public.advertisements(specialty_id);
CREATE INDEX IF NOT EXISTS idx_ads_active ON public.advertisements(is_active);

-- ------------------------------------------------------------------------------
-- Row Level Security (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_study_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()::text AND (is_admin = TRUE OR role = 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Specialties: public read
CREATE POLICY "Specialties are viewable by everyone" ON public.specialties FOR SELECT USING (true);
CREATE POLICY "Service role manages specialties" ON public.specialties FOR ALL USING (true);

-- Profiles: viewable by everyone, service role can update
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Service role manages profiles" ON public.profiles FOR ALL USING (true);

-- Posts: viewable by everyone, service role manages
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Service role manages posts" ON public.posts FOR ALL USING (true);

-- Post Likes
CREATE POLICY "Post likes viewable by everyone" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Service role manages post likes" ON public.post_likes FOR ALL USING (true);

-- Comments
CREATE POLICY "Comments viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Service role manages comments" ON public.comments FOR ALL USING (true);

-- Case Studies
CREATE POLICY "Case studies viewable by everyone" ON public.case_studies FOR SELECT USING (true);
CREATE POLICY "Service role manages case studies" ON public.case_studies FOR ALL USING (true);
CREATE POLICY "Case study specialties readable" ON public.case_study_specialties FOR SELECT USING (true);
CREATE POLICY "Service role manages case study specialties" ON public.case_study_specialties FOR ALL USING (true);

-- Groups & Members
CREATE POLICY "Groups readable by everyone" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Service role manages groups" ON public.groups FOR ALL USING (true);
CREATE POLICY "Group members readable by everyone" ON public.group_members FOR SELECT USING (true);
CREATE POLICY "Service role manages group members" ON public.group_members FOR ALL USING (true);

-- Connections & Follows
CREATE POLICY "Connections readable by everyone" ON public.connections FOR SELECT USING (true);
CREATE POLICY "Service role manages connections" ON public.connections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "All authenticated users manage connections" ON public.connections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Follows readable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Service role manages follows" ON public.follows FOR ALL USING (true);

-- Bookmarks & Notifications
CREATE POLICY "Bookmarks readable by everyone" ON public.bookmarks FOR SELECT USING (true);
CREATE POLICY "Service role manages bookmarks" ON public.bookmarks FOR ALL USING (true);
CREATE POLICY "Notifications readable by everyone" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Service role manages notifications" ON public.notifications FOR ALL USING (true);

-- AI sessions & reports
CREATE POLICY "AI sessions readable by everyone" ON public.ai_sessions FOR SELECT USING (true);
CREATE POLICY "Service role manages ai sessions" ON public.ai_sessions FOR ALL USING (true);
CREATE POLICY "Content reports readable by everyone" ON public.content_reports FOR SELECT USING (true);
CREATE POLICY "Service role manages content reports" ON public.content_reports FOR ALL USING (true);

-- Jobs & Advertisements
CREATE POLICY "Jobs readable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Service role manages jobs" ON public.jobs FOR ALL USING (true);
CREATE POLICY "Advertisements readable by everyone" ON public.advertisements FOR SELECT USING (true);
CREATE POLICY "Service role manages advertisements" ON public.advertisements FOR ALL USING (true);
