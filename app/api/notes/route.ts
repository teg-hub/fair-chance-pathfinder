// app/api/notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
export const runtime = 'nodejs';

type Body = {
  userEmail: string;                 // signed-in user email
  employee_id: string;               // UUID
  department_id: string;             // UUID
  channel_id: string;                // UUID
  occurred_at: string;               // ISO
  duration_minutes: number;          // int
  note_text: string;                 // required
  need_ids: string[];                // >=1, exclusive with opt-out client-side
  other_need_text?: string | null;   // optional
  attachment_paths?: string[];       // optional storage paths
};

export async function POST(req: NextRequest) {
  const admin = supabaseAdmin();
  const body = (await req.json()) as Body;

  // set tenant/session context for RLS
  const s1 = await admin.rpc('set_session_from_email', { p_email: body.userEmail });
  if (s1.error) return NextResponse.json({ error: s1.error.message }, { status: 400 });

  if (!body.note_text?.trim()) return NextResponse.json({ error: 'note_text required' }, { status: 400 });
  if (!body.department_id || !body.channel_id) return NextResponse.json({ error: 'department_id and channel_id required' }, { status: 400 });
  if (!Array.isArray(body.need_ids) || body.need_ids.length < 1) return NextResponse.json({ error: 'at least one need required' }, { status: 400 });

  // coordinator_id = current user under RLS; use server-side lookup
  const me = await admin.from('users').select('id').eq('email', body.userEmail).single();
  if (me.error) return NextResponse.json({ error: me.error.message }, { status: 400 });

  // insert note
  const ins = await admin.from('progress_notes').insert({
    employee_id: body.employee_id,
    coordinator_id: me.data.id,
    department_id: body.department_id,
    channel_id: body.channel_id,
    occurred_at: body.occurred_at,
    duration_minutes: body.duration_minutes,
    note_text: body.note_text,
    // if your schema has other-need text column on the note, include it here:
    other_need_text: body.other_need_text ?? null
  }).select('id').single();
  if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 400 });
  const noteId = ins.data.id as string;

  // link needs
  if (body.need_ids?.length) {
    const rows = body.need_ids.map(nid => ({ note_id: noteId, need_id: nid }));
    const link = await admin.from('progress_note_needs').insert(rows);
    if (link.error) return NextResponse.json({ error: link.error.message }, { status: 400 });
  }

  // attachments metadata (paths already uploaded via client)
  if (body.attachment_paths?.length) {
    const rows = body.attachment_paths.map(p => ({ note_id: noteId, path: p }));
    const att = await admin.from('note_attachments').insert(rows);
    if (att.error) return NextResponse.json({ error: att.error.message }, { status: 400 });
  }

  return NextResponse.json({ id: noteId });
}
