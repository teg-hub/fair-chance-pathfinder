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
    admin.from('users').select('id, email').order('email').limit(200)
  ]);

  if (deps.error) return NextResponse.json({ error: deps.error.message }, { status: 400 });
  if (types.error) return NextResponse.json({ error: types.error.message }, { status: 400 });
  if (coords.error) return NextResponse.json({ error: coords.error.message }, { status: 400 });

  return NextResponse.json({
    departments: deps.data,
    employment_types: types.data,
    coordinators: coords.data
  });
}
