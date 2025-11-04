import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs'; // ensure Node runtime

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// allow only this tenant and roles
const ALLOWED_ORG = '3CDC';
const ALLOWED_ROLES = new Set(['admin','coordinator','read_only'] as const);
type Role = 'admin'|'coordinator'|'read_only';

export async function POST(req: NextRequest) {
  const { email, role }: { email?: string; role?: Role } = await req.json().catch(() => ({}));
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
  const safeRole: Role = (role && ALLOWED_ROLES.has(role)) ? role : 'coordinator';

  const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });
  const { error } = await admin.rpc('provision_user', {
    p_email: email,
    p_org: ALLOWED_ORG,
    p_role: safeRole
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
