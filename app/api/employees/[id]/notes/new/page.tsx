'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Opt = { id: string; name: string; is_opt_out?: boolean; is_other?: boolean };

export default function NewNote() {
  const { id: employeeId } = useParams<{ id: string }>();
  const router = useRouter();
  const sb = supabaseBrowser();

  const [deps, setDeps] = useState<Opt[]>([]);
  const [needs, setNeeds] = useState<Opt[]>([]);
  const [chans, setChans] = useState<Opt[]>([]);
  const [err, setErr] = useState<string>();

  const [department_id, setDept] = useState('');
  const [channel_id, setChan] = useState('');
  const [occurred_at, setWhen] = useState<string>(() => new Date().toISOString().slice(0,16)); // yyyy-mm-ddThh:mm
  const [duration_minutes, setDur] = useState<number>(30);
  const [note_text, setNote] = useState('');
  const [need_ids, setNeedIds] = useState<string[]>([]);
  const [other_need_text, setOtherText] = useState<string>('');
  const [files, setFiles] = useState<FileList | null>(null);

  // load catalogs
  useEffect(() => { (async () => {
    const { data: { user } } = await sb.auth.getUser();
    const res = await fetch('/api/catalogs', { headers: { 'x-user-email': user?.email ?? '' } });
    const j = await res.json();
    if (j.error) setErr(j.error);
    else { setDeps(j.departments); setNeeds(j.needs); setChans(j.channels); }
  })(); }, []);

  const optOutId = useMemo(() => needs.find(n => n.is_opt_out)?.id, [needs]);
  const otherId  = useMemo(() => needs.find(n => n.is_other)?.id,   [needs]);

  function toggleNeed(nid: string) {
    // enforce exclusivity for opt-out
    if (nid === optOutId) setNeedIds([nid]);
    else setNeedIds(prev => (prev.includes(nid) ? prev.filter(x=>x!==nid) : [...prev.filter(x=>x!==optOutId), nid]));
  }

  async function uploadAttachments(): Promise<string[]> {
    if (!files || files.length === 0) return [];
    const paths: string[] = [];
    const { data: { user } } = await sb.auth.getUser();
    for (let i = 0; i < Math.min(files.length, 5); i++) {
      const f = files[i];
      if (f.size > 15 * 1024 * 1024) { throw new Error(`File too large: ${f.name}`); }
      const path = `${user?.id}/${crypto.randomUUID()}-${f.name}`;
      const up = await sb.storage.from('note-attachments').upload(path, f);
      if (up.error) throw up.error;
      paths.push(path);
    }
    return paths;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr(undefined);
    if (!note_text.trim()) { setErr('Note text required'); return; }
    if (!department_id) { setErr('Department required'); return; }
    if (!channel_id) { setErr('Channel required'); return; }
    if (need_ids.length < 1) { setErr('At least one need required'); return; }

    try {
      const paths = await uploadAttachments();
      const { data: { user } } = await sb.auth.getUser();
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user?.email,
          employee_id: employeeId,
          department_id,
          channel_id,
          occurred_at: new Date(occurred_at).toISOString(),
          duration_minutes,
          note_text,
          need_ids,
          other_need_text: (otherId && need_ids.includes(otherId) ? (other_need_text || null) : null),
          attachment_paths: paths
        })
      });
      const j = await res.json();
      if (!res.ok) { setErr(j.error || 'Save failed'); return; }
      router.push(`/employees/${employeeId}`); // go back to employee page
    } catch (e:any) {
      setErr(e.message ?? 'Upload failed');
    }
  }

  return (
    <main className="container" style={{maxWidth:800}}>
      <h2>New Progress Note</h2>
      <form onSubmit={save} style={{display:'grid', gap:12}}>
        <div style={{display:'grid', gap:8, gridTemplateColumns:'repeat(2, minmax(0,1fr))'}}>
          <label>Department<select value={department_id} onChange={e=>setDept(e.target.value)} required>
            <option value="">Select…</option>{deps.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
          </select></label>
          <label>Channel<select value={channel_id} onChange={e=>setChan(e.target.value)} required>
            <option value="">Select…</option>{chans.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select></label>
        </div>

        <div style={{display:'grid', gap:8, gridTemplateColumns:'repeat(2, minmax(0,1fr))'}}>
          <label>Date/Time<input type="datetime-local" value={occurred_at} onChange={e=>setWhen(e.target.value)} required/></label>
          <label>Duration (min)<input type="number" min={1} value={duration_minutes} onChange={e=>setDur(parseInt(e.target.value||'0',10))} required/></label>
        </div>

        <label>Areas of Need</label>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:6}}>
          {needs.map(n=>(
            <label key={n.id} style={{display:'flex', gap:6, alignItems:'center'}}>
              <input
                type="checkbox"
                checked={need_ids.includes(n.id)}
                onChange={()=>toggleNeed(n.id)}
              /> {n.name}
            </label>
          ))}
        </div>
        {otherId && need_ids.includes(otherId) && (
          <input placeholder="Other need details" value={other_need_text} onChange={e=>setOtherText(e.target.value)} />
        )}

        <textarea placeholder="Progress note" value={note_text} onChange={e=>setNote(e.target.value)} required rows={5}/>
        <div>
          <label>Attachments (max 5, ≤15MB each)
            <input type="file" multiple onChange={e=>setFiles(e.target.files)} />
          </label>
        </div>

        {err && <p style={{color:'crimson'}}>{err}</p>}
        <div style={{display:'flex', gap:8}}>
          <button type="submit">Save Note</button>
        </div>
      </form>
    </main>
  );
}
