import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || searchParams.get('search') || '').trim();
    const specialty = (searchParams.get('specialty') || '').trim();
    const type = (searchParams.get('type') || 'all').toLowerCase(); // 'all' | 'profiles' | 'case_studies' | 'posts' | 'groups'
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const currentUser = await serverDb.getCurrentUser();
    const isAdmin = Boolean(currentUser.is_admin || currentUser.role === 'admin');

    const [allProfiles, allCaseStudies, allPosts, allGroups] = await Promise.all([
      // 1. Profiles
      (type === 'all' || type === 'profiles')
        ? serverDb.getProfiles({
            search: q || undefined,
            specialty: specialty || undefined,
          })
        : Promise.resolve([]),

      // 2. Case Studies
      (type === 'all' || type === 'case_studies')
        ? serverDb.getCaseStudies({
            search: q || undefined,
            specialtyIds: specialty ? [specialty] : undefined,
            includeDraftsAndArchived: false,
            currentUserId: currentUser.id,
            isAdmin,
          })
        : Promise.resolve([]),

      // 3. Posts
      (type === 'all' || type === 'posts')
        ? serverDb.getPosts(currentUser.id)
        : Promise.resolve([]),

      // 4. Communities / Groups
      (type === 'all' || type === 'groups')
        ? serverDb.getGroups(currentUser.id)
        : Promise.resolve([]),
    ]);

    // Filter posts by query and specialty
    let matchedPosts = allPosts;
    if (q) {
      const lowerQ = q.toLowerCase();
      matchedPosts = matchedPosts.filter(
        (p) =>
          p.content.toLowerCase().includes(lowerQ) ||
          p.author?.full_name.toLowerCase().includes(lowerQ) ||
          p.author?.title.toLowerCase().includes(lowerQ) ||
          p.specialty?.name.toLowerCase().includes(lowerQ) ||
          p.topic_tags?.some((t) => t.toLowerCase().includes(lowerQ))
      );
    }
    if (specialty) {
      const lowerSpec = specialty.toLowerCase();
      matchedPosts = matchedPosts.filter(
        (p) =>
          p.specialty_id?.toLowerCase() === lowerSpec ||
          p.specialty?.name.toLowerCase() === lowerSpec
      );
    }

    // Filter groups by query and specialty
    let matchedGroups = allGroups;
    if (q) {
      const lowerQ = q.toLowerCase();
      matchedGroups = matchedGroups.filter(
        (g) =>
          g.name.toLowerCase().includes(lowerQ) ||
          g.description.toLowerCase().includes(lowerQ) ||
          g.specialty?.name.toLowerCase().includes(lowerQ) ||
          g.topic_tags?.some((t) => t.toLowerCase().includes(lowerQ))
      );
    }
    if (specialty) {
      const lowerSpec = specialty.toLowerCase();
      matchedGroups = matchedGroups.filter(
        (g) =>
          g.specialty_id?.toLowerCase() === lowerSpec ||
          g.specialty?.name.toLowerCase() === lowerSpec
      );
    }

    const total =
      allProfiles.length +
      allCaseStudies.length +
      matchedPosts.length +
      matchedGroups.length;

    return NextResponse.json({
      query: q,
      specialty: specialty || null,
      profiles: allProfiles.slice(0, limit),
      caseStudies: allCaseStudies.slice(0, limit),
      posts: matchedPosts.slice(0, limit),
      groups: matchedGroups.slice(0, limit),
      total,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to execute global search' },
      { status: 500 }
    );
  }
}
