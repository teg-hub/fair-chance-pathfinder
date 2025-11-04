'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Row = { id: string; employee_id: string; first_name: string|null; last_name: string|null; email: string|null };

export default function EmployeesList() {
  const sb = supabaseBrowser();
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');

  async function load() {
    const session = await sb.auth.getUser();
    const email = session.data.user?.email ?? '';
    const res = await fetch(`/api/employees?q=${encodeURIComponent(q)}`, { headers: { 'x-user-email': email } });
    const json = await res.json();
    setRows(json.data ?? []);
  }

  useEffect(() => { load(); }, []); // initial

  return (
    <main className="container">
      <h2>Employees</h2>
      <div style={{display:'flex', gap:8, margin:'8px 0'}}>
        <input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={load}>Search</button>
        <Link href="/employees/new"><button>New</button></Link>
      </div>
      <ul>
        {rows.map(r => (
          <li key={r.id}>
            <Link href={`/employees/${r.id}`}>{r.employee_id} — {r.first_name ?? ''} {r.last_name ?? ''}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
