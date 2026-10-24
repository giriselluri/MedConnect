import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import {
  Profile,
  Specialty,
  Post,
  Comment,
  CaseStudy,
  CaseStudyStatus,
  Group as CommunityGroup,
  Connection,
  ConnectionStatus,
  Bookmark,
  Notification,
  AISession,
  ContentReport,
  JobListing,
  Advertisement,
  AdminMetrics,
} from '@/types';
import {
  INITIAL_SPECIALTIES,
  INITIAL_PROFILES,
  INITIAL_PROFILE_SPECIALTIES,
  INITIAL_GROUPS,
  INITIAL_CASE_STUDIES,
  INITIAL_POSTS,
  INITIAL_CONNECTIONS,
  INITIAL_JOBS,
  INITIAL_ADVERTISEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS,
} from './server-db';

/**
 * SupabaseDatabase provides complete PostgreSQL persistence for MedConnect AI
 * via Supabase. Used when NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * (or NEXT_PUBLIC_SUPABASE_ANON_KEY) are configured.
 */
class SupabaseDatabase {
  private static instance: SupabaseDatabase;
  private isSeeded: boolean = false;
  private seedingPromise: Promise<void> | null = null;

  public static getInstance(): SupabaseDatabase {
    if (!SupabaseDatabase.instance) {
      SupabaseDatabase.instance = new SupabaseDatabase();
    }
    return SupabaseDatabase.instance;
  }

  private get client() {
    if (!supabaseAdmin) {
      throw new Error('Supabase client is not configured. Check environment variables.');
    }
    return supabaseAdmin;
  }

  /**
   * Automatically ensure baseline tables and canonical seed data exist in Supabase Postgres
   */
  public async ensureSeeded(): Promise<void> {
    if (!isSupabaseConfigured || this.isSeeded) return;
    if (this.seedingPromise) return this.seedingPromise;

    this.seedingPromise = (async () => {
      try {
        const { data: existingProfiles, error } = await this.client
          .from('profiles')
          .select('id')
          .limit(1);

        if (error) {
          console.warn('Supabase check profiles failed (schema may need setup):', error.message);
          return;
        }

        if (!existingProfiles || existingProfiles.length === 0) {
          console.log('Seeding initial MedConnect data into Supabase Postgres...');

          // 1. Specialties
          await this.client.from('specialties').upsert(
            INITIAL_SPECIALTIES.map((s) => ({
              id: s.id,
              name: s.name,
              category: s.category,
              description: s.description,
              icon: s.icon,
            })),
            { onConflict: 'id' }
          );

          // 2. Profiles
          await this.client.from('profiles').upsert(
            INITIAL_PROFILES.map((p) => ({
              id: p.id,
              email: p.email,
              full_name: p.full_name,
              title: p.title,
              role: p.role,
              institution: p.institution,
              location: p.location,
              bio: p.bio,
              avatar_url: p.avatar_url,
              years_of_experience: p.years_of_experience,
              qualifications: p.qualifications,
              interests: p.interests,
              is_admin: Boolean(p.is_admin),
              is_demo: Boolean(p.is_demo !== false),
              is_verified: Boolean(p.is_verified),
              connections_count: p.connections_count,
            })),
            { onConflict: 'id' }
          );

          // 3. Profile Specialties
          await this.client.from('profile_specialties').upsert(
            INITIAL_PROFILE_SPECIALTIES.map((ps) => ({
              profile_id: ps.profile_id,
              specialty_id: ps.specialty_id,
              is_primary: Boolean(ps.is_primary),
            })),
            { onConflict: 'profile_id,specialty_id' }
          );

          // 4. Groups
          await this.client.from('groups').upsert(
            INITIAL_GROUPS.map((g) => ({
              id: g.id,
              name: g.name,
              slug: g.slug,
              description: g.description,
              banner_url: g.banner_url,
              specialty_id: g.specialty_id,
              topic_tags: g.topic_tags,
              members_count: g.members_count,
              created_by: g.created_by,
              created_at: g.created_at,
            })),
            { onConflict: 'id' }
          );

          // 5. Case Studies
          await this.client.from('case_studies').upsert(
            INITIAL_CASE_STUDIES.map((cs) => ({
              id: cs.id,
              title: cs.title,
              short_summary: cs.short_summary,
              educational_content: cs.educational_content,
              learning_objectives: cs.learning_objectives,
              source_references: cs.source_references,
              author_id: cs.author_id,
              author_name: cs.author_name,
              author_title: cs.author_title,
              author_avatar_url: cs.author_avatar_url,
              author_institution: cs.author_institution,
              status: cs.status,
              published_at: cs.published_at,
              views_count: cs.views_count,
              bookmarks_count: cs.bookmarks_count,
              password_protected: Boolean(cs.password_protected),
              access_password: cs.access_password,
              is_private: Boolean(cs.is_private),
              shared_with_user_ids: cs.shared_with_user_ids || [],
              visibility: cs.visibility || 'everyone',
              group_id: cs.group_id,
              created_at: cs.created_at,
              updated_at: cs.updated_at,
            })),
            { onConflict: 'id' }
          );

          // Case study specialties
          const csSpecs: { case_study_id: string; specialty_id: string }[] = [];
          for (const cs of INITIAL_CASE_STUDIES) {
            for (const sp of cs.specialties || []) {
              csSpecs.push({ case_study_id: cs.id, specialty_id: sp.id });
            }
          }
          if (csSpecs.length > 0) {
            await this.client.from('case_study_specialties').upsert(csSpecs, {
              onConflict: 'case_study_id,specialty_id',
            });
          }

          // 6. Posts
          await this.client.from('posts').upsert(
            INITIAL_POSTS.map((p) => ({
              id: p.id,
              author_id: p.author_id,
              content: p.content,
              article_url: p.article_url,
              article_title: p.article_title,
              article_source: p.article_source,
              specialty_id: p.specialty_id,
              topic_tags: p.topic_tags,
              group_id: p.group_id,
              visibility: p.visibility || 'everyone',
              repost_of_id: p.repost_of_id,
              quote_comment: p.quote_comment,
              likes_count: p.likes_count,
              comments_count: p.comments_count,
              reposts_count: p.reposts_count,
              created_at: p.created_at,
              updated_at: p.updated_at,
            })),
            { onConflict: 'id' }
          );

          // 7. Connections
          await this.client.from('connections').upsert(
            INITIAL_CONNECTIONS.map((c) => ({
              id: c.id,
              requester_id: c.requester_id,
              recipient_id: c.recipient_id,
              status: c.status,
              created_at: c.created_at,
              updated_at: c.updated_at,
            })),
            { onConflict: 'id' }
          );

          // 8. Jobs
          await this.client.from('jobs').upsert(
            INITIAL_JOBS.map((j) => ({
              id: j.id,
              title: j.title,
              organization: j.organization,
              location: j.location,
              specialty_id: j.specialty_id,
              workplace_type: j.workplace_type || 'on-site',
              employment_type: j.employment_type || 'full-time',
              description: j.description,
              requirements: j.requirements,
              apply_url: j.apply_url,
              is_active: Boolean(j.is_active),
              is_sample: Boolean(j.is_demo),
              created_at: j.created_at,
              updated_at: j.updated_at,
            })),
            { onConflict: 'id' }
          );

          // 9. Advertisements
          await this.client.from('advertisements').upsert(
            INITIAL_ADVERTISEMENTS.map((a) => ({
              id: a.id,
              title: a.title,
              sponsor_name: a.sponsor,
              headline: a.headline,
              content: a.body_text,
              target_url: a.target_url,
              cta_label: a.cta_text || 'Learn More',
              specialty_id: a.specialty_id,
              badge_label: 'Sponsored Clinical Notice',
              is_active: Boolean(a.is_active),
              is_sample: Boolean(a.is_demo),
              created_at: a.created_at,
              updated_at: a.updated_at,
            })),
            { onConflict: 'id' }
          );

          console.log('MedConnect baseline dataset seeded to Supabase Postgres successfully.');
        }

        this.isSeeded = true;
      } catch (err) {
        console.error('Error during Supabase auto-seeding:', err);
      } finally {
        this.seedingPromise = null;
      }
    })();

    return this.seedingPromise;
  }

  // --- Profiles ---

  public async getProfiles(filters?: { role?: string; specialty?: string; search?: string }): Promise<Profile[]> {
    await this.ensureSeeded();
    let query = this.client
      .from('profiles')
      .select('*, profile_specialties(specialty_id, specialties(*))');

    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    let profiles: Profile[] = (data || []).map((row: any) => this.mapProfile(row));

    if (filters?.specialty) {
      const lowerSpec = filters.specialty.toLowerCase();
      profiles = profiles.filter((p) =>
        p.specialties?.some((s) => s.id.toLowerCase() === lowerSpec || s.name.toLowerCase() === lowerSpec)
      );
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      profiles = profiles.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          p.institution?.toLowerCase().includes(q) ||
          p.title?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.bio?.toLowerCase().includes(q) ||
          p.specialties?.some((s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) ||
          p.qualifications?.some((qual) => qual.toLowerCase().includes(q))
      );
    }

    return profiles;
  }

  public async getProfileById(id: string): Promise<Profile | null> {
    await this.ensureSeeded();
    const { data, error } = await this.client
      .from('profiles')
      .select('*, profile_specialties(specialty_id, specialties(*))')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapProfile(data);
  }

  public async registerUser(payload: {
    full_name: string;
    email: string;
    role: any;
    title: string;
    institution?: string;
    location?: string;
    specialty_ids?: string[];
    bio?: string;
    years_of_experience?: number;
    qualifications?: string[];
    password?: string;
  }): Promise<Profile> {
    await this.ensureSeeded();
    const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      payload.full_name
    )}&background=0d9488&color=fff&bold=true`;

    const profileData = {
      id: newId,
      email: payload.email.trim().toLowerCase(),
      full_name: payload.full_name.trim(),
      title: payload.title.trim(),
      role: payload.role,
      institution: payload.institution?.trim() || 'Academic Medical Center',
      location: payload.location?.trim() || 'United States',
      bio: payload.bio?.trim() || 'Practicing healthcare professional dedicated to evidence-based clinical care.',
      avatar_url: avatar,
      years_of_experience: Number(payload.years_of_experience) || 5,
      qualifications: payload.qualifications && payload.qualifications.length > 0
        ? payload.qualifications
        : ['MD / Healthcare Credential'],
      interests: [],
      is_admin: false,
      is_demo: false,
      is_verified: true,
      connections_count: 0,
      password: payload.password,
    };

    const { error: insertError } = await this.client.from('profiles').insert([profileData]);
    if (insertError) throw new Error(insertError.message);

    if (payload.specialty_ids && payload.specialty_ids.length > 0) {
      const specs = payload.specialty_ids.map((spId) => ({
        profile_id: newId,
        specialty_id: spId,
        is_primary: true,
      }));
      await this.client.from('profile_specialties').insert(specs);
    }

    return (await this.getProfileById(newId))!;
  }

  public async loginUser(identifier: string): Promise<Profile | null> {
    await this.ensureSeeded();
    const clean = identifier.trim().toLowerCase();
    const { data } = await this.client
      .from('profiles')
      .select('*, profile_specialties(specialty_id, specialties(*))')
      .or(`id.eq.${identifier},email.ilike.${clean},full_name.ilike.%${clean}%`)
      .limit(1)
      .maybeSingle();

    if (!data) {
      return null;
    }
    return this.mapProfile(data);
  }

  public async updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
    await this.ensureSeeded();
    const { error } = await this.client
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return (await this.getProfileById(id))!;
  }

  // --- Specialties ---

  public async getSpecialties(): Promise<Specialty[]> {
    await this.ensureSeeded();
    const { data, error } = await this.client
      .from('specialties')
      .select('*')
      .order('name');

    if (error) throw new Error(error.message);
    return (data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      category: s.category || 'Clinical Medicine',
      description: s.description || '',
      icon: s.icon,
    }));
  }

  // --- Posts ---

  public async getPosts(currentUserId?: string, groupId?: string): Promise<Post[]> {
    await this.ensureSeeded();
    let query = this.client
      .from('posts')
      .select('*, profiles!author_id(*), specialties(*), comments(*, profiles!author_id(*)), post_likes(user_id)')
      .order('created_at', { ascending: false });

    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const currentUser = currentUserId ? await this.getProfileById(currentUserId) : null;
    const isDemo = Boolean(currentUser && currentUser.is_demo !== false && currentUser.id?.startsWith('00000000-'));

    let list: Post[] = (data || []).map((row: any) => this.mapPost(row, currentUserId));

    // Remove default/sample feeds for newly registered users
    if (!isDemo && currentUserId) {
      const connections = await this.getEstablishedConnectionIds(currentUserId);
      const follows = await this.getFollowingIds(currentUserId);
      const userSpecs = currentUser?.specialties?.map((s) => s.id) || [];

      list = list.filter((p) => {
        if (p.id.startsWith('30000000-')) return false;
        if (p.author_id.startsWith('00000000-')) return false;

        if (p.author_id === currentUserId) return true;
        if (p.visibility === 'connections') return connections.includes(p.author_id);
        if (p.visibility === 'followers') return follows.includes(p.author_id) || connections.includes(p.author_id);

        const isConn = connections.includes(p.author_id);
        const isFoll = follows.includes(p.author_id);
        const matchesSpec = Boolean(p.specialty_id && userSpecs.includes(p.specialty_id));
        return isConn || isFoll || matchesSpec;
      });
    }

    return list;
  }

  public async createPost(payload: {
    author_id: string;
    content: string;
    specialty_id?: string;
    topic_tags?: string[];
    article_url?: string;
    article_title?: string;
    article_source?: string;
    group_id?: string;
    visibility?: 'everyone' | 'connections' | 'followers' | 'group';
  }): Promise<Post> {
    await this.ensureSeeded();
    const newId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const postRow = {
      id: newId,
      author_id: payload.author_id,
      content: payload.content.trim(),
      specialty_id: payload.specialty_id || null,
      topic_tags: payload.topic_tags || [],
      article_url: payload.article_url || null,
      article_title: payload.article_title || null,
      article_source: payload.article_source || null,
      group_id: payload.group_id || null,
      visibility: payload.visibility || 'everyone',
      likes_count: 0,
      comments_count: 0,
      reposts_count: 0,
    };

    const { error } = await this.client.from('posts').insert([postRow]);
    if (error) throw new Error(error.message);

    const posts = await this.getPosts(payload.author_id);
    return posts.find((p) => p.id === newId)!;
  }

  public async deletePost(id: string, userId: string, isAdmin: boolean = false): Promise<boolean> {
    await this.ensureSeeded();
    let query = this.client.from('posts').delete().eq('id', id);
    if (!isAdmin) {
      query = query.eq('author_id', userId);
    }
    const { error } = await query;
    return !error;
  }

  public async toggleLikePost(postId: string, userId: string): Promise<{ is_liked: boolean; likes_count: number }> {
    await this.ensureSeeded();
    const { data: existing } = await this.client
      .from('post_likes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await this.client.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    } else {
      await this.client.from('post_likes').insert([{ post_id: postId, user_id: userId }]);
    }

    const { count } = await this.client
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    const likesCount = count || 0;
    await this.client.from('posts').update({ likes_count: likesCount }).eq('id', postId);

    return { is_liked: !existing, likes_count: likesCount };
  }

  public async addComment(postId: string, authorId: string, content: string): Promise<Comment> {
    await this.ensureSeeded();
    const newId = `comment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const commentRow = {
      id: newId,
      post_id: postId,
      author_id: authorId,
      content: content.trim(),
    };

    const { error } = await this.client.from('comments').insert([commentRow]);
    if (error) throw new Error(error.message);

    const { count } = await this.client
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    await this.client.from('posts').update({ comments_count: count || 1 }).eq('id', postId);

    const author = await this.getProfileById(authorId);
    return {
      id: newId,
      post_id: postId,
      author_id: authorId,
      author: author || INITIAL_PROFILES[0],
      content: content.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  public async updateComment(commentId: string, content: string, userId: string, isAdmin: boolean = false): Promise<Comment> {
    await this.ensureSeeded();
    let query = this.client
      .from('comments')
      .update({ content: content.trim(), updated_at: new Date().toISOString() })
      .eq('id', commentId);

    if (!isAdmin) {
      query = query.eq('author_id', userId);
    }
    const { error } = await query;
    if (error) throw new Error(error.message);

    const { data } = await this.client.from('comments').select('*, profiles!author_id(*)').eq('id', commentId).single();
    return {
      id: data.id,
      post_id: data.post_id,
      author_id: data.author_id,
      author: this.mapProfile(data.profiles),
      content: data.content,
      created_at: data.created_at,
      updated_at: data.updated_at || data.created_at,
    };
  }

  public async deleteComment(commentId: string, userId: string, isAdmin: boolean = false): Promise<boolean> {
    await this.ensureSeeded();
    const { data: existing } = await this.client.from('comments').select('post_id, author_id').eq('id', commentId).maybeSingle();
    if (!existing) return false;
    if (!isAdmin && existing.author_id !== userId) return false;

    await this.client.from('comments').delete().eq('id', commentId);

    const { count } = await this.client
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', existing.post_id);

    await this.client.from('posts').update({ comments_count: count || 0 }).eq('id', existing.post_id);
    return true;
  }

  public async repostPost(postId: string, userId: string, quoteComment?: string): Promise<Post> {
    await this.ensureSeeded();
    const orig = (await this.getPosts()).find((p) => p.id === postId);
    if (!orig) throw new Error('Original post not found');

    const newId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const repostRow = {
      id: newId,
      author_id: userId,
      content: quoteComment?.trim() || `Reposted clinical insight from ${orig.author?.full_name}`,
      specialty_id: orig.specialty_id || null,
      repost_of_id: postId,
      quote_comment: quoteComment?.trim() || null,
      likes_count: 0,
      comments_count: 0,
      reposts_count: 0,
    };

    await this.client.from('posts').insert([repostRow]);
    await this.client.from('posts').update({ reposts_count: (orig.reposts_count || 0) + 1 }).eq('id', postId);

    const posts = await this.getPosts(userId);
    return posts.find((p) => p.id === newId)!;
  }

  // --- Case Studies ---

  public async getCaseStudies(options?: {
    specialtyIds?: string[];
    search?: string;
    includeDraftsAndArchived?: boolean;
    currentUserId?: string;
    isAdmin?: boolean;
    personalized?: boolean;
  }): Promise<CaseStudy[]> {
    await this.ensureSeeded();
    let query = this.client
      .from('case_studies')
      .select('*, case_study_specialties(specialty_id, specialties(*))')
      .order('created_at', { ascending: false });

    if (!options?.includeDraftsAndArchived) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    let list: CaseStudy[] = (data || []).map((row: any) => this.mapCaseStudy(row));

    const effectiveUserId = options?.currentUserId;
    const isAdmin = Boolean(options?.isAdmin);

    // Private cases filtering
    list = list.filter((cs) => {
      if (!cs.is_private) return true;
      if (isAdmin) return true;
      if (effectiveUserId && cs.author_id === effectiveUserId) return true;
      if (effectiveUserId && cs.shared_with_user_ids?.includes(effectiveUserId)) return true;
      if (cs.password_protected) return true;
      return false;
    });

    // Public case study audience visibility filtering
    if (!isAdmin) {
      const connections = effectiveUserId ? await this.getEstablishedConnectionIds(effectiveUserId) : [];
      list = list.filter((cs) => {
        if (cs.is_private) return true;
        if (cs.author_id === effectiveUserId) return true;
        if (!cs.visibility || cs.visibility === 'everyone') return true;
        if (cs.visibility === 'connections') {
          return Boolean(effectiveUserId && cs.author_id && connections.includes(cs.author_id));
        }
        if (cs.visibility === 'followers') {
          return Boolean(effectiveUserId && cs.author_id && connections.includes(cs.author_id));
        }
        return true;
      });
    }

    // Specialty filter
    if (options?.specialtyIds && options.specialtyIds.length > 0) {
      const targetIds = options.specialtyIds.map((s) => s.toLowerCase());
      list = list.filter((cs) =>
        cs.specialties.some((s) => targetIds.includes(s.id.toLowerCase()) || targetIds.includes(s.name.toLowerCase()))
      );
    }

    // Personalized feed filter
    if (options?.personalized && effectiveUserId && !isAdmin) {
      const connections = await this.getEstablishedConnectionIds(effectiveUserId);
      const userProfile = await this.getProfileById(effectiveUserId);
      const userSpecialtyIds = (userProfile?.specialties || []).map((s) => s.id);

      list = list.filter((cs) => {
        if (cs.author_id === effectiveUserId) return true;
        if (cs.author_id && connections.includes(cs.author_id)) return true;
        if (cs.shared_with_user_ids?.includes(effectiveUserId)) return true;
        const matchesSpec = cs.specialties.some((s) => userSpecialtyIds.includes(s.id));
        return matchesSpec;
      });
    }

    // Search query
    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.short_summary.toLowerCase().includes(q) ||
          c.author_name.toLowerCase().includes(q) ||
          c.educational_content.toLowerCase().includes(q) ||
          c.specialties.some((s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
      );
    }

    return list.map(({ access_password, ...cs }) => cs);
  }

  public async getCaseStudyById(
    id: string,
    isAdmin: boolean = false,
    password?: string,
    bypass: boolean = false,
    currentUserId?: string
  ): Promise<(CaseStudy & { is_locked?: boolean }) | null> {
    await this.ensureSeeded();
    const { data, error } = await this.client
      .from('case_studies')
      .select('*, case_study_specialties(specialty_id, specialties(*))')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    const cs = this.mapCaseStudy(data);

    if (cs.status !== 'published' && !isAdmin && cs.author_id !== currentUserId) {
      return null;
    }

    const isAuthor = cs.author_id === currentUserId;
    const isShared = Boolean(cs.shared_with_user_ids?.includes(currentUserId || ''));
    if (cs.is_private && !isAuthor && !isShared && !isAdmin) {
      return null;
    }

    if (cs.visibility === 'connections' && !isAuthor && !isAdmin) {
      const isConnected = currentUserId ? await this.areUsersConnected(currentUserId, cs.author_id) : false;
      if (!isConnected) return null;
    }

    const isProtected = Boolean(cs.password_protected);
    const isUnlocked = !isProtected || (bypass && isAdmin) || (Boolean(password) && password === cs.access_password);

    const { access_password, ...sanitized } = cs;
    if (!isUnlocked) {
      return {
        ...sanitized,
        is_locked: true,
        educational_content: '',
        learning_objectives: [],
        source_references: [],
      };
    }

    return {
      ...sanitized,
      is_locked: false,
    };
  }

  public async verifyCaseStudyPassword(
    id: string,
    password: string,
    currentUserId?: string,
    isAdmin: boolean = false
  ): Promise<{ valid: boolean; caseStudy?: CaseStudy & { is_locked: boolean }; error?: string }> {
    await this.ensureSeeded();
    const { data } = await this.client.from('case_studies').select('*, case_study_specialties(specialty_id, specialties(*))').eq('id', id).maybeSingle();
    if (!data) return { valid: false, error: 'Case study not found' };

    const cs = this.mapCaseStudy(data);
    const isAuthor = cs.author_id === currentUserId;
    const isShared = Boolean(cs.shared_with_user_ids?.includes(currentUserId || ''));
    if (cs.is_private && !isAuthor && !isShared && !isAdmin) {
      return { valid: false, error: 'Unauthorized: You do not have permission to access this private case study.' };
    }

    if (!cs.password_protected || cs.access_password === password.trim()) {
      const { access_password, ...sanitized } = cs;
      return { valid: true, caseStudy: { ...sanitized, is_locked: false } };
    }
    return { valid: false, error: 'Incorrect access password. Please try again.' };
  }

  public async createCaseStudy(payload: {
    title: string;
    short_summary: string;
    educational_content: string;
    learning_objectives: string[];
    source_references: string[];
    specialty_ids: string[];
    author_id?: string;
    status: CaseStudyStatus;
    password_protected?: boolean;
    access_password?: string;
    is_private?: boolean;
    shared_with_user_ids?: string[];
    visibility?: 'everyone' | 'connections' | 'followers' | 'group';
    group_id?: string;
  }, userId: string): Promise<CaseStudy> {
    await this.ensureSeeded();
    const author = (await this.getProfileById(payload.author_id || userId))!;
    const newId = `case_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const passwordProtected = Boolean(payload.password_protected) || Boolean(payload.access_password?.trim());

    const csRow = {
      id: newId,
      title: payload.title,
      short_summary: payload.short_summary,
      educational_content: payload.educational_content,
      learning_objectives: payload.learning_objectives,
      source_references: payload.source_references || [],
      author_id: author.id,
      author_name: author.full_name,
      author_title: author.title,
      author_avatar_url: author.avatar_url || (author.full_name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(author.full_name)}&background=0d9488&color=fff&bold=true` : null),
      author_institution: author.institution,
      status: payload.status || 'published',
      published_at: payload.status !== 'draft' ? new Date().toISOString() : null,
      views_count: 0,
      bookmarks_count: 0,
      password_protected: passwordProtected,
      access_password: payload.access_password?.trim() || (passwordProtected ? 'clinical2024' : null),
      is_private: Boolean(payload.is_private),
      shared_with_user_ids: payload.shared_with_user_ids || [],
      visibility: payload.visibility || 'everyone',
      group_id: payload.group_id || null,
    };

    const { error } = await this.client.from('case_studies').insert([csRow]);
    if (error) throw new Error(error.message);

    if (payload.specialty_ids && payload.specialty_ids.length > 0) {
      await this.client.from('case_study_specialties').insert(
        payload.specialty_ids.map((spId) => ({
          case_study_id: newId,
          specialty_id: spId,
        }))
      );
    }

    // If private or password protected and shared with users, notify each recipient
    if ((Boolean(payload.is_private) || passwordProtected) && Array.isArray(payload.shared_with_user_ids) && payload.shared_with_user_ids.length > 0) {
      const recipients = payload.shared_with_user_ids.filter((uid: string) => uid && uid !== author.id);
      const effectivePassword = csRow.access_password;
      const passText = passwordProtected && effectivePassword ? ` Access Password: ${effectivePassword}` : '';
      for (const recipientId of recipients) {
        await this.createNotification({
          user_id: recipientId,
          actor_id: author.id,
          type: 'case_study',
          item_id: newId,
          item_title: payload.title,
          link: `/case-studies/${newId}`,
          message: `${author.full_name} shared a private case study with you: "${payload.title}".${passText}`,
        });
      }
    }

    return (await this.getCaseStudyById(newId, true, undefined, true, userId))!;
  }

  public async shareCaseStudy(
    caseStudyId: string,
    recipientUserId: string,
    currentUserId: string,
    isAdmin: boolean = false
  ): Promise<{ success: boolean; message: string; caseStudy: CaseStudy }> {
    await this.ensureSeeded();
    const { data: rawCs, error: fetchErr } = await this.client
      .from('case_studies')
      .select('*')
      .eq('id', caseStudyId)
      .maybeSingle();

    if (fetchErr || !rawCs) throw new Error('Case study not found');
    if (rawCs.author_id !== currentUserId && !isAdmin) {
      throw new Error('Forbidden: Only the author or administrator can share this case study');
    }

    const recipient = await this.getProfileById(recipientUserId);
    if (!recipient) throw new Error('Recipient user not found');

    const currentShared: string[] = Array.isArray(rawCs.shared_with_user_ids) ? rawCs.shared_with_user_ids : [];
    if (!currentShared.includes(recipientUserId)) {
      currentShared.push(recipientUserId);
    }

    const { error: updateErr } = await this.client
      .from('case_studies')
      .update({
        shared_with_user_ids: currentShared,
        is_private: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', caseStudyId);

    if (updateErr) throw new Error(updateErr.message);

    const author = (await this.getProfileById(rawCs.author_id || currentUserId))!;
    const passText = rawCs.password_protected && rawCs.access_password ? ` Access Password: ${rawCs.access_password}` : '';

    await this.createNotification({
      user_id: recipientUserId,
      actor_id: author.id,
      type: 'case_study',
      item_id: rawCs.id,
      item_title: rawCs.title,
      link: `/case-studies/${rawCs.id}`,
      message: `${author.full_name} shared a private case study with you: "${rawCs.title}".${passText}`,
    });

    const updated = await this.getCaseStudyById(caseStudyId, true, undefined, true, currentUserId);
    return { success: true, message: 'Case study shared successfully and recipient notified', caseStudy: updated! };
  }

  public async updateCaseStudy(id: string, updates: Partial<CaseStudy> & { specialty_ids?: string[] }, userId: string, isAdmin: boolean): Promise<CaseStudy> {
    await this.ensureSeeded();
    let query = this.client.from('case_studies').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
    if (!isAdmin) {
      query = query.eq('author_id', userId);
    }
    const { error } = await query;
    if (error) throw new Error(error.message);

    if (updates.specialty_ids) {
      await this.client.from('case_study_specialties').delete().eq('case_study_id', id);
      await this.client.from('case_study_specialties').insert(
        updates.specialty_ids.map((spId) => ({ case_study_id: id, specialty_id: spId }))
      );
    }

    return (await this.getCaseStudyById(id, isAdmin, undefined, true, userId))!;
  }

  public async deleteCaseStudy(id: string, userId: string, isAdmin: boolean): Promise<boolean> {
    await this.ensureSeeded();
    let query = this.client.from('case_studies').delete().eq('id', id);
    if (!isAdmin) {
      query = query.eq('author_id', userId);
    }
    const { error } = await query;
    return !error;
  }

  // --- Groups ---

  public async getGroups(): Promise<CommunityGroup[]> {
    await this.ensureSeeded();
    const { data } = await this.client.from('groups').select('*').order('name');
    return (data || []).map((g: any) => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      description: g.description,
      banner_url: g.banner_url,
      specialty_id: g.specialty_id,
      topic_tags: g.topic_tags || [],
      members_count: g.members_count || 0,
      created_by: g.created_by,
      created_at: g.created_at,
    }));
  }

  public async getGroupBySlug(slug: string, userId?: string): Promise<CommunityGroup | null> {
    await this.ensureSeeded();
    const { data } = await this.client.from('groups').select('*').eq('slug', slug).maybeSingle();
    if (!data) return null;

    let is_member = false;
    if (userId) {
      const { data: mem } = await this.client.from('group_members').select('*').eq('group_id', data.id).eq('user_id', userId).maybeSingle();
      is_member = Boolean(mem);
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      banner_url: data.banner_url,
      specialty_id: data.specialty_id,
      topic_tags: data.topic_tags || [],
      members_count: data.members_count || 0,
      created_by: data.created_by,
      is_member,
      created_at: data.created_at,
    };
  }

  public async toggleGroupMembership(groupId: string, userId: string): Promise<{ joined: boolean; members_count: number }> {
    await this.ensureSeeded();
    const { data: mem } = await this.client.from('group_members').select('*').eq('group_id', groupId).eq('user_id', userId).maybeSingle();
    if (mem) {
      await this.client.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId);
    } else {
      await this.client.from('group_members').insert([{ group_id: groupId, user_id: userId, role: 'member' }]);
    }

    const { count } = await this.client.from('group_members').select('*', { count: 'exact', head: true }).eq('group_id', groupId);
    const membersCount = count || 0;
    await this.client.from('groups').update({ members_count: membersCount }).eq('id', groupId);

    return { joined: !mem, members_count: membersCount };
  }

  public async createGroup(payload: { name: string; description: string; specialty_id?: string; topic_tags?: string[] }, userId: string): Promise<CommunityGroup> {
    await this.ensureSeeded();
    const newId = `group_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const groupRow = {
      id: newId,
      name: payload.name.trim(),
      slug,
      description: payload.description.trim(),
      specialty_id: payload.specialty_id || null,
      topic_tags: payload.topic_tags || [],
      members_count: 1,
      created_by: userId,
    };

    await this.client.from('groups').insert([groupRow]);
    await this.client.from('group_members').insert([{ group_id: newId, user_id: userId, role: 'admin' }]);

    return (await this.getGroupBySlug(slug, userId))!;
  }

  // --- Connections ---

  public async getConnectionById(id: string): Promise<Connection | null> {
    await this.ensureSeeded();
    const { data, error } = await this.client
      .from('connections')
      .select('*, requester:profiles!requester_id(*), recipient:profiles!recipient_id(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    const conn = this.mapConnection(data);
    if (!conn.requester && conn.requester_id) {
      conn.requester = (await this.getProfileById(conn.requester_id)) || undefined;
    }
    if (!conn.recipient && conn.recipient_id) {
      conn.recipient = (await this.getProfileById(conn.recipient_id)) || undefined;
    }
    return conn;
  }

  public async getConnections(userId: string): Promise<{
    connections: Connection[];
    pendingIncoming: Connection[];
    pendingOutgoing: Connection[];
    pending_sent: Connection[];
    pending_received: Connection[];
  }> {
    await this.ensureSeeded();
    const { data, error } = await this.client
      .from('connections')
      .select('*, requester:profiles!requester_id(*), recipient:profiles!recipient_id(*)')
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

    if (error) {
      console.warn('Error fetching connections from Supabase:', error.message);
    }

    const all = (data || []).map((row: any) => this.mapConnection(row));

    // Batch-fetch any missing profiles if PostgREST embedding returned null or array mismatches
    const missingProfileIds = new Set<string>();
    for (const c of all) {
      if (!c.requester && c.requester_id) missingProfileIds.add(c.requester_id);
      if (!c.recipient && c.recipient_id) missingProfileIds.add(c.recipient_id);
    }
    if (missingProfileIds.size > 0) {
      const { data: missingRows } = await this.client
        .from('profiles')
        .select('*, profile_specialties(specialty_id, specialties(*))')
        .in('id', Array.from(missingProfileIds));
      if (missingRows && missingRows.length > 0) {
        const profileMap = new Map<string, Profile>();
        for (const row of missingRows) {
          profileMap.set(row.id, this.mapProfile(row));
        }
        for (const c of all) {
          if (!c.requester && profileMap.has(c.requester_id)) {
            c.requester = profileMap.get(c.requester_id);
          }
          if (!c.recipient && profileMap.has(c.recipient_id)) {
            c.recipient = profileMap.get(c.recipient_id);
          }
        }
      }
    }

    // Defensive fallback so connection UI cards never disappear
    for (const c of all) {
      if (!c.requester && c.requester_id) {
        c.requester = {
          id: c.requester_id,
          email: '',
          full_name: 'Medical Colleague',
          title: 'Healthcare Professional',
          role: 'healthcare_professional',
          years_of_experience: 5,
          qualifications: [],
          interests: [],
          is_admin: false,
          is_verified: false,
          created_at: c.created_at,
        };
      }
      if (!c.recipient && c.recipient_id) {
        c.recipient = {
          id: c.recipient_id,
          email: '',
          full_name: 'Medical Colleague',
          title: 'Healthcare Professional',
          role: 'healthcare_professional',
          years_of_experience: 5,
          qualifications: [],
          interests: [],
          is_admin: false,
          is_verified: false,
          created_at: c.created_at,
        };
      }
    }

    const accepted = all.filter((c) => c.status === 'accepted');
    const pendingIncoming = all.filter((c) => c.recipient_id === userId && c.status === 'pending');
    const pendingOutgoing = all.filter((c) => c.requester_id === userId && c.status === 'pending');

    return {
      connections: accepted,
      pendingIncoming,
      pendingOutgoing,
      pending_sent: pendingOutgoing,
      pending_received: pendingIncoming,
    };
  }

  public async sendConnectionRequest(requesterId: string, recipientId: string): Promise<Connection> {
    await this.ensureSeeded();
    if (requesterId === recipientId) {
      throw new Error('Cannot send connection request to yourself');
    }

    // Check bidirectional existing connection
    const { data: existingRows } = await this.client
      .from('connections')
      .select('*, requester:profiles!requester_id(*), recipient:profiles!recipient_id(*)')
      .or(`and(requester_id.eq.${requesterId},recipient_id.eq.${recipientId}),and(requester_id.eq.${recipientId},recipient_id.eq.${requesterId})`);

    const existing = existingRows && existingRows[0];
    if (existing) {
      const mapped = this.mapConnection(existing);
      if (mapped.status === 'accepted') {
        return mapped;
      }
      if (mapped.status === 'pending') {
        if (mapped.requester_id === requesterId) {
          // Already sent outgoing pending request
          return mapped;
        } else {
          // Recipient previously sent request to requester: auto-accept to connect them
          return this.updateConnectionStatus(mapped.id, 'accepted', requesterId);
        }
      }
      if (mapped.status === 'declined') {
        // Reactivate connection request
        const { error: reErr } = await this.client
          .from('connections')
          .update({
            requester_id: requesterId,
            recipient_id: recipientId,
            status: 'pending',
            updated_at: new Date().toISOString(),
          })
          .eq('id', mapped.id);

        if (reErr) throw new Error(reErr.message);

        const requester = await this.getProfileById(requesterId);
        await this.createNotification({
          user_id: recipientId,
          actor_id: requesterId,
          type: 'connection_request',
          message: `${requester?.full_name || 'A clinician'} sent you a connection request.`,
        });

        const refreshed = await this.getConnectionById(mapped.id);
        return refreshed || mapped;
      }
    }

    const newId = `conn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const connRow = {
      id: newId,
      requester_id: requesterId,
      recipient_id: recipientId,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: insertErr } = await this.client.from('connections').insert([connRow]);
    if (insertErr) throw new Error(insertErr.message);

    // Notify recipient
    const requester = await this.getProfileById(requesterId);
    await this.createNotification({
      user_id: recipientId,
      actor_id: requesterId,
      type: 'connection_request',
      message: `${requester?.full_name || 'A clinician'} sent you a connection request.`,
    });

    const conn = await this.getConnectionById(newId);
    return conn || this.mapConnection(connRow);
  }

  public async updateConnectionStatus(connectionId: string, status: ConnectionStatus, userId: string): Promise<Connection> {
    await this.ensureSeeded();

    const { data: existing, error: fetchErr } = await this.client
      .from('connections')
      .select('*')
      .eq('id', connectionId)
      .maybeSingle();

    if (fetchErr || !existing) throw new Error('Connection not found');
    if (existing.recipient_id !== userId && existing.requester_id !== userId) {
      throw new Error('Unauthorized');
    }

    const previousStatus = existing.status;

    const { error: updateErr } = await this.client
      .from('connections')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', connectionId);

    if (updateErr) throw new Error(updateErr.message);

    // Update connection counts and send acceptance notification
    if (status === 'accepted' && previousStatus !== 'accepted') {
      await this.recalculateConnectionsCount(existing.requester_id);
      await this.recalculateConnectionsCount(existing.recipient_id);

      const targetUserId = existing.requester_id === userId ? existing.recipient_id : existing.requester_id;
      const accepter = await this.getProfileById(userId);
      await this.createNotification({
        user_id: targetUserId,
        actor_id: userId,
        type: 'connection_accepted',
        message: `${accepter?.full_name || 'Your peer'} accepted your connection request.`,
      });
    } else if (previousStatus === 'accepted' && status !== 'accepted') {
      await this.recalculateConnectionsCount(existing.requester_id);
      await this.recalculateConnectionsCount(existing.recipient_id);
    }

    const conn = await this.getConnectionById(connectionId);
    return conn || this.mapConnection({ ...existing, status });
  }

  public async removeConnection(connectionId: string, userId: string): Promise<boolean> {
    await this.ensureSeeded();
    const { data: existing } = await this.client
      .from('connections')
      .select('*')
      .eq('id', connectionId)
      .maybeSingle();

    if (!existing) return false;
    if (existing.requester_id !== userId && existing.recipient_id !== userId) {
      throw new Error('Unauthorized');
    }

    const wasAccepted = existing.status === 'accepted';
    const { error } = await this.client.from('connections').delete().eq('id', connectionId);
    if (error) return false;

    if (wasAccepted) {
      await this.recalculateConnectionsCount(existing.requester_id);
      await this.recalculateConnectionsCount(existing.recipient_id);
    }
    return true;
  }

  private async recalculateConnectionsCount(userId: string): Promise<void> {
    try {
      const { count, error } = await this.client
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

      if (!error && typeof count === 'number') {
        await this.client
          .from('profiles')
          .update({ connections_count: count })
          .eq('id', userId);
      }
    } catch (e) {
      console.warn('Error updating connection count for profile:', userId, e);
    }
  }

  public async areUsersConnected(userAId?: string, userBId?: string): Promise<boolean> {
    if (!userAId || !userBId) return false;
    if (userAId === userBId) return true;
    await this.ensureSeeded();
    const { data } = await this.client
      .from('connections')
      .select('id')
      .eq('status', 'accepted')
      .or(`and(requester_id.eq.${userAId},recipient_id.eq.${userBId}),and(requester_id.eq.${userBId},recipient_id.eq.${userAId})`)
      .limit(1);

    return Boolean(data && data.length > 0);
  }

  public async getEstablishedConnectionIds(userId: string): Promise<string[]> {
    if (!userId) return [];
    await this.ensureSeeded();
    const { data } = await this.client
      .from('connections')
      .select('requester_id, recipient_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

    const set = new Set<string>();
    for (const row of data || []) {
      if (row.requester_id === userId) set.add(row.recipient_id);
      if (row.recipient_id === userId) set.add(row.requester_id);
    }
    return Array.from(set);
  }

  // --- Follows ---

  public async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    await this.ensureSeeded();
    const { data } = await this.client.from('follows').select('*').eq('follower_id', followerId).eq('following_id', followingId).maybeSingle();
    return Boolean(data);
  }

  public async followUser(followerId: string, followingId: string): Promise<boolean> {
    await this.ensureSeeded();
    await this.client.from('follows').upsert([{ follower_id: followerId, following_id: followingId }], { onConflict: 'follower_id,following_id' });
    return true;
  }

  public async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    await this.ensureSeeded();
    await this.client.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId);
    return true;
  }

  public async getFollowStats(userId: string): Promise<{ followers_count: number; following_count: number }> {
    await this.ensureSeeded();
    const { count: followers } = await this.client.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId);
    const { count: following } = await this.client.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId);
    return { followers_count: followers || 0, following_count: following || 0 };
  }

  private async getFollowingIds(userId: string): Promise<string[]> {
    const { data } = await this.client.from('follows').select('following_id').eq('follower_id', userId);
    return (data || []).map((f: any) => f.following_id);
  }

  // --- Bookmarks ---

  public async getBookmarks(userId: string): Promise<Bookmark[]> {
    await this.ensureSeeded();
    const { data } = await this.client.from('bookmarks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return data || [];
  }

  public async toggleBookmark(payload: { user_id: string; item_type: any; item_id: string; item_title?: string; item_summary?: string; item_url?: string }): Promise<{ bookmarked: boolean }> {
    await this.ensureSeeded();
    const { data: existing } = await this.client
      .from('bookmarks')
      .select('*')
      .eq('user_id', payload.user_id)
      .eq('item_type', payload.item_type)
      .eq('item_id', payload.item_id)
      .maybeSingle();

    if (existing) {
      await this.client.from('bookmarks').delete().eq('id', existing.id);
      return { bookmarked: false };
    } else {
      await this.client.from('bookmarks').insert([{
        id: `bm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...payload,
      }]);
      return { bookmarked: true };
    }
  }

  // --- Notifications ---

  public async getNotifications(userId: string): Promise<{ notifications: Notification[]; unread_count: number }> {
    await this.ensureSeeded();
    const { data } = await this.client
      .from('notifications')
      .select('*, sender:profiles!sender_id(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const notifications: Notification[] = (data || []).map((n: any) => ({
      id: n.id,
      user_id: n.user_id,
      actor_id: n.sender_id,
      actor: n.sender ? this.mapProfile(n.sender) : undefined,
      type: n.type,
      message: n.message,
      is_read: Boolean(n.is_read),
      link: n.link,
      created_at: n.created_at,
    }));

    const unreadCount = notifications.filter((n) => !n.is_read).length;
    return { notifications, unread_count: unreadCount };
  }

  public async createNotification(payload: {
    user_id: string;
    actor_id: string;
    type: Notification['type'];
    item_id?: string;
    item_title?: string;
    message: string;
    link?: string;
  }): Promise<Notification> {
    await this.ensureSeeded();
    const newId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const row = {
      id: newId,
      user_id: payload.user_id,
      sender_id: payload.actor_id || null,
      type: payload.type,
      title: 'MedConnect Notification',
      message: payload.message,
      link: payload.link || null,
      is_read: false,
    };
    await this.client.from('notifications').insert([row]);
    return {
      id: newId,
      user_id: payload.user_id,
      actor_id: payload.actor_id,
      type: payload.type,
      item_id: payload.item_id,
      item_title: payload.item_title,
      message: payload.message,
      is_read: false,
      created_at: new Date().toISOString(),
    };
  }

  public async markNotificationRead(id: string, userId: string): Promise<boolean> {
    await this.ensureSeeded();
    const { error } = await this.client.from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', userId);
    return !error;
  }

  public async markAllNotificationsRead(userId: string): Promise<boolean> {
    await this.ensureSeeded();
    const { error } = await this.client.from('notifications').update({ is_read: true }).eq('user_id', userId);
    return !error;
  }

  // --- AI Sessions ---

  public async saveAISession(payload: { user_id: string; title: string; source_text: string; source_url?: string; structured_summary: any }): Promise<AISession> {
    await this.ensureSeeded();
    const newId = `ai_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const row = {
      id: newId,
      user_id: payload.user_id,
      title: payload.title,
      source_text: payload.source_text,
      source_url: payload.source_url || null,
      structured_summary: payload.structured_summary,
    };
    await this.client.from('ai_sessions').insert([row]);
    return {
      id: newId,
      user_id: payload.user_id,
      title: payload.title,
      source_text: payload.source_text,
      source_url: payload.source_url,
      structured_summary: payload.structured_summary,
      created_at: new Date().toISOString(),
    };
  }

  public async getAISessions(userId: string): Promise<AISession[]> {
    await this.ensureSeeded();
    const { data } = await this.client.from('ai_sessions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return data || [];
  }

  // --- Content Reports ---

  public async createContentReport(payload: { reporter_id: string; content_type: any; content_id: string; reason: string }): Promise<ContentReport> {
    await this.ensureSeeded();
    const newId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const row = {
      id: newId,
      reporter_id: payload.reporter_id,
      content_type: payload.content_type,
      content_id: payload.content_id,
      reason: payload.reason,
      status: 'pending',
    };
    await this.client.from('content_reports').insert([row]);
    return {
      id: newId,
      reporter_id: payload.reporter_id,
      content_type: payload.content_type,
      content_id: payload.content_id,
      reason: payload.reason,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
  }

  public async getContentReports(): Promise<ContentReport[]> {
    await this.ensureSeeded();
    const { data } = await this.client.from('content_reports').select('*, reporter:profiles!reporter_id(*)').order('created_at', { ascending: false });
    return (data || []).map((r: any) => ({
      id: r.id,
      reporter_id: r.reporter_id,
      reporter: r.reporter ? this.mapProfile(r.reporter) : undefined,
      content_type: r.content_type,
      content_id: r.content_id,
      reason: r.reason,
      status: r.status,
      created_at: r.created_at,
      reviewed_at: r.reviewed_at,
      reviewed_by: r.reviewed_by,
    }));
  }

  public async updateContentReportStatus(reportId: string, status: any, reviewerId: string): Promise<ContentReport> {
    await this.ensureSeeded();
    await this.client.from('content_reports').update({ status, reviewed_at: new Date().toISOString(), reviewed_by: reviewerId }).eq('id', reportId);
    const reports = await this.getContentReports();
    return reports.find((r) => r.id === reportId)!;
  }

  // --- Jobs ---

  public async getJobs(options?: { specialty_id?: string; is_active?: boolean; search?: string }): Promise<JobListing[]> {
    await this.ensureSeeded();
    let query = this.client.from('jobs').select('*, specialties(*)').order('created_at', { ascending: false });

    if (options?.is_active !== undefined) {
      query = query.eq('is_active', options.is_active);
    }
    if (options?.specialty_id) {
      query = query.eq('specialty_id', options.specialty_id);
    }

    const { data } = await query;
    let list: JobListing[] = (data || []).map((j: any) => ({
      id: j.id,
      title: j.title,
      organization: j.organization,
      location: j.location,
      employment_type: j.employment_type || 'Full-time',
      specialty_id: j.specialty_id,
      specialty_name: j.specialties?.name,
      description: j.description,
      requirements: j.requirements || [],
      apply_url: j.apply_url,
      is_active: Boolean(j.is_active),
      is_demo: Boolean(j.is_sample),
      created_at: j.created_at,
      updated_at: j.updated_at,
    }));

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter((j) => j.title.toLowerCase().includes(q) || j.organization.toLowerCase().includes(q) || j.location.toLowerCase().includes(q));
    }
    return list;
  }

  public async getJobById(id: string): Promise<JobListing | null> {
    const jobs = await this.getJobs();
    return jobs.find((j) => j.id === id) || null;
  }

  public async createJob(payload: Partial<JobListing>): Promise<JobListing> {
    await this.ensureSeeded();
    const newId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const row = {
      id: newId,
      title: payload.title,
      organization: payload.organization,
      location: payload.location,
      specialty_id: payload.specialty_id || null,
      employment_type: payload.employment_type || 'Full-time',
      description: payload.description,
      requirements: payload.requirements || [],
      apply_url: payload.apply_url,
      is_active: payload.is_active !== undefined ? payload.is_active : true,
      is_sample: false,
    };
    await this.client.from('jobs').insert([row]);
    return (await this.getJobById(newId))!;
  }

  public async updateJob(id: string, updates: Partial<JobListing>): Promise<JobListing> {
    await this.ensureSeeded();
    await this.client.from('jobs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
    return (await this.getJobById(id))!;
  }

  public async deleteJob(id: string): Promise<boolean> {
    await this.ensureSeeded();
    const { error } = await this.client.from('jobs').delete().eq('id', id);
    return !error;
  }

  // --- Advertisements ---

  public async getAdvertisements(options?: { specialty_id?: string; is_active?: boolean; search?: string }): Promise<Advertisement[]> {
    await this.ensureSeeded();
    let query = this.client.from('advertisements').select('*, specialties(*)').order('created_at', { ascending: false });

    if (options?.is_active !== undefined) {
      query = query.eq('is_active', options.is_active);
    }
    if (options?.specialty_id) {
      query = query.eq('specialty_id', options.specialty_id);
    }

    const { data } = await query;
    let list: Advertisement[] = (data || []).map((a: any) => ({
      id: a.id,
      title: a.title,
      sponsor: a.sponsor_name,
      headline: a.headline,
      body_text: a.content,
      target_url: a.target_url,
      cta_text: a.cta_label,
      specialty_id: a.specialty_id,
      specialty_name: a.specialties?.name,
      is_active: Boolean(a.is_active),
      is_demo: Boolean(a.is_sample),
      created_at: a.created_at,
      updated_at: a.updated_at,
    }));

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.sponsor.toLowerCase().includes(q) || a.headline.toLowerCase().includes(q));
    }
    return list;
  }

  public async getAdvertisementById(id: string): Promise<Advertisement | null> {
    const ads = await this.getAdvertisements();
    return ads.find((a) => a.id === id) || null;
  }

  public async createAdvertisement(payload: Partial<Advertisement>): Promise<Advertisement> {
    await this.ensureSeeded();
    const newId = `ad_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const row = {
      id: newId,
      title: payload.title,
      sponsor_name: payload.sponsor,
      headline: payload.headline,
      content: payload.body_text,
      target_url: payload.target_url,
      cta_label: payload.cta_text || 'Learn More',
      specialty_id: payload.specialty_id || null,
      badge_label: 'Sponsored Clinical Notice',
      is_active: payload.is_active !== undefined ? payload.is_active : true,
      is_sample: false,
    };
    await this.client.from('advertisements').insert([row]);
    return (await this.getAdvertisementById(newId))!;
  }

  public async updateAdvertisement(id: string, updates: Partial<Advertisement>): Promise<Advertisement> {
    await this.ensureSeeded();
    const row: any = { updated_at: new Date().toISOString() };
    if (updates.title) row.title = updates.title;
    if (updates.sponsor) row.sponsor_name = updates.sponsor;
    if (updates.headline) row.headline = updates.headline;
    if (updates.body_text) row.content = updates.body_text;
    if (updates.target_url) row.target_url = updates.target_url;
    if (updates.cta_text) row.cta_label = updates.cta_text;
    if (updates.specialty_id !== undefined) row.specialty_id = updates.specialty_id;
    if (updates.is_active !== undefined) row.is_active = updates.is_active;

    await this.client.from('advertisements').update(row).eq('id', id);
    return (await this.getAdvertisementById(id))!;
  }

  public async deleteAdvertisement(id: string): Promise<boolean> {
    await this.ensureSeeded();
    const { error } = await this.client.from('advertisements').delete().eq('id', id);
    return !error;
  }

  // --- Admin Metrics ---

  public async getAdminMetrics(): Promise<AdminMetrics> {
    await this.ensureSeeded();
    const [profiles, casesTotal, casesPublished, casesDraft, casesArchived, posts, groups, reports, jobsTotal, jobsActive, adsTotal, adsActive] = await Promise.all([
      this.client.from('profiles').select('id', { count: 'exact', head: true }),
      this.client.from('case_studies').select('id', { count: 'exact', head: true }),
      this.client.from('case_studies').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      this.client.from('case_studies').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
      this.client.from('case_studies').select('id', { count: 'exact', head: true }).eq('status', 'archived'),
      this.client.from('posts').select('id', { count: 'exact', head: true }),
      this.client.from('groups').select('id', { count: 'exact', head: true }),
      this.client.from('content_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      this.client.from('jobs').select('id', { count: 'exact', head: true }),
      this.client.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', true),
      this.client.from('advertisements').select('id', { count: 'exact', head: true }),
      this.client.from('advertisements').select('id', { count: 'exact', head: true }).eq('is_active', true),
    ]);

    return {
      totalUsers: profiles.count || 0,
      totalPosts: posts.count || 0,
      totalCaseStudies: casesTotal.count || 0,
      publishedCaseStudies: casesPublished.count || 0,
      draftCaseStudies: casesDraft.count || 0,
      archivedCaseStudies: casesArchived.count || 0,
      totalGroups: groups.count || 0,
      pendingReports: reports.count || 0,
      totalJobs: jobsTotal.count || 0,
      activeJobs: jobsActive.count || 0,
      totalAds: adsTotal.count || 0,
      activeAds: adsActive.count || 0,
    };
  }

  // --- Private Mapping Helpers ---

  private mapProfile(row: any): Profile {
    const specs = (row.profile_specialties || []).map((ps: any) => ps.specialties).filter(Boolean);
    return {
      id: row.id,
      email: row.email || '',
      full_name: row.full_name,
      title: row.title,
      role: row.role,
      institution: row.institution || '',
      location: row.location || '',
      bio: row.bio || '',
      avatar_url: row.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.full_name)}&background=0d9488&color=fff&bold=true`,
      years_of_experience: row.years_of_experience || 0,
      qualifications: row.qualifications || [],
      interests: row.interests || [],
      is_admin: Boolean(row.is_admin),
      is_demo: Boolean(row.is_demo),
      is_verified: Boolean(row.is_verified),
      connections_count: row.connections_count || 0,
      specialties: specs,
      created_at: row.created_at,
    };
  }

  private mapPost(row: any, currentUserId?: string): Post {
    const author = row.profiles ? this.mapProfile(row.profiles) : INITIAL_PROFILES[0];
    const specialty = row.specialties ? {
      id: row.specialties.id,
      name: row.specialties.name,
      category: row.specialties.category,
      description: row.specialties.description,
      icon: row.specialties.icon,
    } : undefined;

    const comments: Comment[] = (row.comments || []).map((c: any) => ({
      id: c.id,
      post_id: c.post_id,
      author_id: c.author_id,
      author: c.profiles ? this.mapProfile(c.profiles) : INITIAL_PROFILES[0],
      content: c.content,
      created_at: c.created_at,
      updated_at: c.updated_at || c.created_at,
    })).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const is_liked = Boolean(currentUserId && row.post_likes?.some((l: any) => l.user_id === currentUserId));

    return {
      id: row.id,
      author_id: row.author_id,
      author,
      content: row.content,
      article_url: row.article_url,
      article_title: row.article_title,
      article_source: row.article_source,
      specialty_id: row.specialty_id,
      specialty,
      topic_tags: row.topic_tags || [],
      group_id: row.group_id,
      visibility: row.visibility || 'everyone',
      repost_of_id: row.repost_of_id,
      quote_comment: row.quote_comment,
      likes_count: row.likes_count || 0,
      comments_count: comments.length || row.comments_count || 0,
      reposts_count: row.reposts_count || 0,
      is_liked,
      comments,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapCaseStudy(row: any): CaseStudy {
    const specs: Specialty[] = (row.case_study_specialties || []).map((cs: any) => cs.specialties).filter(Boolean);
    const { access_password, ...sanitized } = row;

    return {
      id: sanitized.id,
      title: sanitized.title,
      short_summary: sanitized.short_summary,
      educational_content: sanitized.educational_content,
      learning_objectives: sanitized.learning_objectives || [],
      source_references: sanitized.source_references || [],
      author_id: sanitized.author_id,
      author_name: sanitized.author_name,
      author_title: sanitized.author_title,
      author_avatar_url: sanitized.author_avatar_url,
      author_institution: sanitized.author_institution,
      status: sanitized.status,
      published_at: sanitized.published_at,
      views_count: sanitized.views_count || 0,
      bookmarks_count: sanitized.bookmarks_count || 0,
      password_protected: Boolean(sanitized.password_protected),
      access_password,
      is_private: Boolean(sanitized.is_private),
      shared_with_user_ids: sanitized.shared_with_user_ids || [],
      visibility: sanitized.visibility || 'everyone',
      group_id: sanitized.group_id,
      specialties: specs.length > 0 ? specs : [INITIAL_SPECIALTIES[0]],
      created_at: sanitized.created_at,
      updated_at: sanitized.updated_at,
    };
  }

  private mapConnection(row: any): Connection {
    const rawReq = Array.isArray(row.requester) ? row.requester[0] : row.requester;
    const rawRec = Array.isArray(row.recipient) ? row.recipient[0] : row.recipient;
    return {
      id: row.id,
      requester_id: row.requester_id,
      recipient_id: row.recipient_id,
      status: row.status,
      requester: rawReq ? this.mapProfile(rawReq) : undefined,
      recipient: rawRec ? this.mapProfile(rawRec) : undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}

export const supabaseDb = SupabaseDatabase.getInstance();
