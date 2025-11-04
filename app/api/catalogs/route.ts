import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const email = req.headers.get('x-user-email') ?? '';
  const admin = supabaseAdmin();
  const s1 = await admin.rpc('set_session_from_email', { p_email: email });
  if (s1.error) return NextResponse.json({ error: s1.error.message }, { status: 400 });

  const [deps, types, coords] = await Promise.all([
    admin.from('departments').select('id, name').order('name'),
    admin.from('employment_types').select('id, name').order('name'),
    admin
      .from('users')
      .select('id, email')
      .in('id', admin
        .from('user_organizations')
        // Note: PostgREST nested filters aren’t great from server; keep it simple:
        // We return all users in tenant via a view normally. For MVP, just return users table;
        // RLS will scope to tenant.
      )
  ]);
  // Simplify: just return users table scoped by RLS
  const coords2 = await admin.from('users').select('id, email').limit(200);

  if (deps.error || types.error || coords2.error)
    return NextResponse.json({ error: deps.error?.message || types.error?.message || coords2.error?.message }, { status: 400 });

  return NextResponse.json({
    departments: deps.data,
    employment_types: types.data,
    coordinators: coords2.data
  });
}
