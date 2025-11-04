import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const email = req.headers.get('x-user-email') ?? '';
  const admin = supabaseAdmin();
  // set session for this request
  const s1 = await admin.rpc('set_session_from_email', { p_email: email });
  if (s1.error) return NextResponse.json({ error: s1.error.message }, { status: 400 });

  const q = new URL(req.url).searchParams.get('q') ?? '';
  const { data, error } = await admin
    .from('employees')
    .select('id, employee_id, first_name, last_name, email')
    .ilike('employee_id', `%${q}%`)
    .limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const { email: userEmail } = await req.json();
  const admin = supabaseAdmin();
  const s1 = await admin.rpc('set_session_from_email', { p_email: userEmail });
  if (s1.error) return NextResponse.json({ error: s1.error.message }, { status: 400 });

  const body = await req.json();
  const payload = {
    org_id: undefined, // filled by RLS via GUCs
    employee_id: body.employee_id,
    first_name: body.first_name ?? null,
    last_name: body.last_name ?? null,
    email: body.emp_email ?? null,
    phone_numbers: body.phone_numbers ?? [],
    department_id: body.department_id,
    employment_type_id: body.employment_type_id,
    assigned_coordinator_id: body.assigned_coordinator_id
  };

  const { data, error } = await admin.from('employees').insert(payload).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id });
}
