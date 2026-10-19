export type UserRole =
  | 'admin'
  | 'healthcare_professional'
  | 'medical_student'
  | 'researcher'
  | 'pharmaceutical_professional'
  | 'other_healthcare_professional';

export type Role = UserRole;

export type CaseStudyStatus = 'draft' | 'published' | 'archived';

export type ConnectionStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface Specialty {
  id: string;
  name: string;
  category: string;
  description?: string;
  icon?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  title: string;
  role: UserRole;
  institution?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  years_of_experience: number;
  qualifications: string[];
  interests: string[];
  is_admin: boolean;
  is_verified?: boolean;
  connections_count?: number;
  specialties?: Specialty[];
  created_at?: string;
  updated_at?: string;
}

export interface Post {
  id: string;
  author_id: string;
  author: Profile;
  content: string;
  article_url?: string;
  article_title?: string;
  article_source?: string;
  specialty_id?: string;
  specialty?: Specialty;
  topic_tags: string[];
  group_id?: string;
  visibility?: 'everyone' | 'connections' | 'followers' | 'group';
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  repost_of_id?: string;
  repost_of?: Post;
  quote_comment?: string;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  created_at: string;
  updated_at: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author: Profile;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  short_summary: string;
  educational_content: string;
  learning_objectives: string[];
  source_references: string[];
  author_id?: string;
  author_name: string;
  author_title?: string;
  status: CaseStudyStatus;
  published_at?: string | null;
  views_count?: number;
  bookmarks_count?: number;
  specialties: Specialty[];
  password_protected?: boolean;
  access_password?: string; // only stored server-side, never returned in API
  is_locked?: boolean;
  is_private?: boolean;
  shared_with_user_ids?: string[];
  visibility?: 'everyone' | 'connections' | 'followers' | 'group';
  group_id?: string;
  group?: Group;
  created_at: string;
  updated_at: string;
  is_bookmarked?: boolean;
}

export interface Group {
  id: string;
  name: string;
  slug: string;
  description: string;
  banner_url?: string;
  specialty_id?: string;
  specialty?: Specialty;
  topic_tags: string[];
  members_count: number;
  is_member?: boolean;
  created_by?: string;
  created_at: string;
}

export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: ConnectionStatus;
  requester?: Profile;
  recipient?: Profile;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  item_type: 'post' | 'case_study' | 'news' | 'journal';
  item_id: string;
  item_title?: string;
  item_summary?: string;
  item_url?: string;
  created_at: string;
}

export interface AISession {
  id: string;
  user_id: string;
  title: string;
  source_text: string;
  source_url?: string;
  structured_summary: {
    plain_language_summary: string;
    research_question: string;
    methodology: string;
    key_findings: string[];
    limitations: string[];
    discussion_questions: string[];
    relevant_keywords: string[];
    disclaimer?: string;
    model_used?: 'gemini-1.5-flash' | 'clinical-heuristic-fallback';
  };
  created_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source_name: string;
  source_url: string;
  published_at: string;
  specialty_id: string;
  specialty_name: string;
  image_url?: string;
  is_bookmarked?: boolean;
}

export interface JournalArticle {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  doi: string;
  published_date: string;
  specialty_id: string;
  specialty_name: string;
  citation_count: number;
  open_access_url?: string;
  is_bookmarked?: boolean;
}

export interface ContentReport {
  id: string;
  reporter_id: string;
  reporter?: Profile;
  content_type: 'post' | 'comment' | 'case_study' | 'user';
  content_id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface JobListing {
  id: string;
  title: string;
  organization: string;
  location: string;
  employment_type: 'Full-time' | 'Part-time' | 'Fellowship' | 'Locum Tenens';
  specialty_id?: string;
  specialty_name?: string;
  salary_range?: string;
  description: string;
  requirements: string[];
  apply_url?: string;
  is_active: boolean;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Advertisement {
  id: string;
  title: string;
  sponsor: string;
  headline: string;
  body_text: string;
  image_url?: string;
  target_url: string;
  cta_text: string;
  specialty_id?: string;
  specialty_name?: string;
  is_active: boolean;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string; // recipient
  actor_id: string; // actor
  actor?: Profile;
  type: 'connection_request' | 'connection_accepted' | 'post_like' | 'post_comment' | 'repost' | 'follow';
  item_id?: string;
  item_title?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}
