'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Row = { id: string; employee_id: string; first_name: string|null; last_name: string|null; email: string|null };

export default function EmployeesList() {
  const sb = supabaseBrowser();
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [err, setErr] = useState<string>();

  async function load() {
    setErr(undefined);
    const { data: { user } } = await sb.auth.getUser();
    const res = await fetch(`/api/employees?q=${encodeURIComponent(q)}`, {
      headers: { 'x-user-email': user?.email ?? '' }
    });
    const j = await res.json();
    if (!res.ok) setErr(j.error);
    else setRows(j.data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm('Delete this employee?')) return;
    const { data: { user } } = await sb.auth.getUser();
    const res = await fetch(`/api/employees/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-email': user?.email ?? '' }
    });
    const j = await res.json();
    if (!res.ok) { setErr(j.error); return; }
    load();
  }

  return (
    <main className="container">
      <h2>Employees</h2>
      <div style={{display:'flex', gap:8, margin:'8px 0'}}>
        <input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={load}>Search</button>
        <Link href="/employees/new"><button>Create New</button></Link>
      </div>
      {err && <p style={{color:'crimson'}}>{err}</p>}
      <ul style={{display:'grid', gap:6}}>
        {rows.map(r => (
          <li key={r.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 12px'}}>
            <div>
              <strong>{r.employee_id}</strong> — {r.first_name ?? ''} {r.last_name ?? ''} <span style={{opacity:.7}}>{r.email ?? ''}</span>
            </div>
            <div style={{display:'flex', gap:8}}>
              <Link href={`/employees/${r.id}`}><button>Edit</button></Link>
              <button onClick={()=>remove(r.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
