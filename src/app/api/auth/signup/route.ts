import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';
import { Role } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      full_name,
      email,
      role = 'healthcare_professional',
      title,
      institution,
      location,
      specialty_ids,
      bio,
      years_of_experience,
      qualifications,
    } = body;

    if (!full_name || !full_name.trim()) {
      return NextResponse.json({ error: 'Full name and degree are required' }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Clinical/institutional email is required' }, { status: 400 });
    }
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Professional medical title is required' }, { status: 400 });
    }

    const validRoles: Role[] = ['admin', 'healthcare_professional', 'medical_student', 'researcher'];
    const assignedRole: Role = validRoles.includes(role) ? role : 'healthcare_professional';

    const newUser = serverDb.registerUser({
      full_name: full_name.trim(),
      email: email.trim(),
      role: assignedRole,
      title: title.trim(),
      institution: institution?.trim() || 'Medical Academic Center',
      location: location?.trim() || 'United States',
      specialty_ids: Array.isArray(specialty_ids) ? specialty_ids : [],
      bio: bio?.trim(),
      years_of_experience: Number(years_of_experience) || 5,
      qualifications: Array.isArray(qualifications) && qualifications.length > 0 ? qualifications : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Clinical profile registered and verified successfully',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to register clinical profile' },
      { status: 400 }
    );
  }
}
