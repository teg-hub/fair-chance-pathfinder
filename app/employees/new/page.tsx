'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Opt = { id: string; name?: string; email?: string };

export default function NewEmployee() {
  const sb = supabaseBrowser();
  const [deps, setDeps] = useState<Opt[]>([]);
  const [types, setTypes] = useState<Opt[]>([]);
  const [coords, setCoords] = useState<Opt[]>([]);
  const [form, setForm] = useState<any>({ employee_id:'', first_name:'', last_name:'', emp_email:'', phone_numbers:[] as string[], department_id:'', employment_type_id:'', assigned_coordinator_id:'' });
  const [err, setErr] = useState<string>();

  useEffect(() => { (async () => {
    const { data: { user } } = await sb.auth.getUser();
    const res = await fetch('/api/catalogs', { headers: { 'x-user-email': user?.email ?? '' }});
    const j = await res.json();
    if (j.error) setErr(j.error);
    else { setDeps(j.departments); setTypes(j.employment_types); setCoords(j.coordinators); }
  })(); }, []);

  function update(k: string, v: any) { setForm((p:any)=>({...p, [k]:v})); }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr(undefined);
    const { data: { user } } = await sb.auth.getUser();
    const res = await fetch('/api/employees', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...form, email: user?.email }) });
    const j = await res.json();
    if (!res.ok) { setErr(j.error); return; }
    window.location.href = `/employees/${j.id}`;
  }

  return (
    <main className="container" style={{maxWidth:640}}>
      <h2>New Employee</h2>
      <form onSubmit={save} style={{display:'grid', gap:10}}>
        <input placeholder="Employee ID" value={form.employee_id} onChange={e=>update('employee_id', e.target.value)} required />
        <div style={{display:'flex', gap:8}}>
          <input placeholder="First name" value={form.first_name} onChange={e=>update('first_name', e.target.value)} />
          <input placeholder="Last name" value={form.last_name} onChange={e=>update('last_name', e.target.value)} />
        </div>
        <input placeholder="Email" value={form.emp_email} onChange={e=>update('emp_email', e.target.value)} />
        <div style={{display:'grid', gap:6}}>
          <input placeholder="Phone 1" value={form.phone_numbers[0] ?? ''} onChange={e=>{
            const arr=[...form.phone_numbers]; arr[0]=e.target.value; update('phone_numbers', arr);
          }} />
          <input placeholder="Phone 2 (optional)" value={form.phone_numbers[1] ?? ''} onChange={e=>{
            const arr=[...form.phone_numbers]; arr[1]=e.target.value; update('phone_numbers', arr);
          }} />
        </div>
        <select value={form.department_id} onChange={e=>update('department_id', e.target.value)} required>
          <option value="">Select department</option>
          {deps.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={form.employment_type_id} onChange={e=>update('employment_type_id', e.target.value)} required>
          <option value="">Select employment type</option>
          {types.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={form.assigned_coordinator_id} onChange={e=>update('assigned_coordinator_id', e.target.value)} required>
          <option value="">Assign coordinator</option>
          {coords.map(c=> <option key={c.id} value={c.id}>{c.email}</option>)}
        </select>
        <button type="submit">Create</button>
        {err && <p style={{color:'crimson'}}>{err}</p>}
      </form>
    </main>
  );
}
