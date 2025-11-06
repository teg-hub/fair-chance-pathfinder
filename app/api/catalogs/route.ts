import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const email = req.headers.get('x-user-email') ?? '';
  const admin = supabaseAdmin();

  const s1 = await admin.rpc('set_session_from_email', { p_email: email });
  if (s1.error) return NextResponse.json({ error: s1.error.message }, { status: 400 });

  const [deps, types, coords, needs, chans] = await Promise.all([
    admin.from('departments').select('id,name').eq('active', true).order('name'),
    admin.from('employment_types').select('id,name').eq('active', true).order('name'),
    admin.from('users').select('id,email').order('email').limit(200),
    admin.from('areas_of_need').select('id,name,active').eq('active', true).order('name'),
    admin.from('channels').select('id,name,active').eq('active', true).order('name'),
  ]);
  for (const r of [deps, types, coords, needs, chans]) {
    if (r.error) return NextResponse.json({ error: r.error.message }, { status: 400 });
  }

  return NextResponse.json({
    departments: deps.data,
    employment_types: types.data,
    coordinators: coords.data,
    needs: needs.data,
    channels: chans.data,
  });
}
