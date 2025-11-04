import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error:'email required' }, { status:400 });

  const admin = supabaseAdmin();
  const { data, error } = await admin.rpc('set_session_from_user', { p_email: email });
  if (error || !data?.[0]) return NextResponse.json({ error: error?.message ?? 'no org mapping' }, { status:400 });

  const { org_id, role, user_id } = data[0];
  // set GUCs for this request
  await admin.rpc('set_session', { p_org: org_id, p_role: role, p_user: user_id });
  return NextResponse.json({ ok:true, org_id, role, user_id });
}
