import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = supabaseAdmin();
  // Expect email in header for RLS
  const email = _req.headers.get('x-user-email') ?? '';
  const s1 = await admin.rpc('set_session_from_email', { p_email: email });
  if (s1.error) return NextResponse.json({ error: s1.error.message }, { status: 400 });

  const { data, error } = await admin
    .from('employees')
    .select('id, employee_id, first_name, last_name, email, phone_numbers, department_id, employment_type_id, assigned_coordinator_id')
    .eq('id', params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const admin = supabaseAdmin();
  const s1 = await admin.rpc('set_session_from_email', { p_email: body.email });
  if (s1.error) return NextResponse.json({ error: s1.error.message }, { status: 400 });

  const updates = {
    employee_id: body.employee_id,
    first_name: body.first_name ?? null,
    last_name: body.last_name ?? null,
    email: body.emp_email ?? null,
    phone_numbers: body.phone_numbers ?? [],
    department_id: body.department_id,
    employment_type_id: body.employment_type_id,
    assigned_coordinator_id: body.assigned_coordinator_id
  };

  const { error } = await admin.from('employees').update(updates).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const email = req.headers.get('x-user-email') ?? '';
  const admin = supabaseAdmin();
  const s1 = await admin.rpc('set_session_from_email', { p_email: email });
  if (s1.error) return NextResponse.json({ error: s1.error.message }, { status: 400 });

  const { error } = await admin.from('employees').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
