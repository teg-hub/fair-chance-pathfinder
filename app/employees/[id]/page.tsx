'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Opt = { id: string; name?: string; email?: string };

export default function EditEmployee() {
  const sb = supabaseBrowser();
  const { id } = useParams<{ id: string }>();
  const [deps, setDeps] = useState<Opt[]>([]);
  const [types, setTypes] = useState<Opt[]>([]);
  const [coords, setCoords] = useState<Opt[]>([]);
  const [form, setForm] = useState<any>();
  const [err, setErr] = useState<string>();

  function update(k: string, v: any) { setForm((p:any)=>({...p, [k]:v})); }

  useEffect(() => { (async () => {
    const { data: { user } } = await sb.auth.getUser();
    const [catRes, empRes] = await Promise.all([
      fetch('/api/catalogs', { headers: { 'x-user-email': user?.email ?? '' } }),
      fetch(`/api/employees/${id}`, { headers: { 'x-user-email': user?.email ?? '' } })
    ]);
    const cat = await catRes.json(); const emp = await empRes.json();
    if (cat.error) setErr(cat.error);
    else { setDeps(cat.departments); setTypes(cat.employment_types); setCoords(cat.coordinators); }
    if (emp.error) setErr(emp.error); else setForm({
      employee_id: emp.data.employee_id, first_name: emp.data.first_name, last_name: emp.data.last_name,
      emp_email: emp.data.email, phone_numbers: emp.data.phone_numbers ?? [],
      department_id: emp.data.department_id, employment_type_id: emp.data.employment_type_id,
      assigned_coordinator_id: emp.data.assigned_coordinator_id
    });
  })(); }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault(); setErr(undefined);
    const { data: { user } } = await sb.auth.getUser();
    const res = await fetch(`/api/employees/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...form, email: user?.email }) });
    const j = await res.json(); if (!res.ok) { setErr(j.error); return; }
    window.location.href = '/employees';
  }

  async function remove() {
    const { data: { user } } = await sb.auth.getUser();
    const res = await fetch(`/api/employees/${id}`, { method:'DELETE', headers: { 'x-user-email': user?.email ?? '' } });
    const j = await res.json(); if (!res.ok) { setErr(j.error); return; }
    window.location.href = '/employees';
  }

  if (!form) return <main className="container">Loading…</main>;

  return (
    <main className="container" style={{maxWidth:640}}>
      <h2>Edit Employee</h2>
      <form onSubmit={save} style={{display:'grid', gap:10}}>
        <input placeholder="Employee ID" value={form.employee_id} onChange={e=>update('employee_id', e.target.value)} required />
        <div style={{display:'flex', gap:8}}>
          <input placeholder="First name" value={form.first_name ?? ''} onChange={e=>update('first_name', e.target.value)} />
          <input placeholder="Last name" value={form.last_name ?? ''} onChange={e=>update('last_name', e.target.value)} />
        </div>
        <input placeholder="Email" value={form.emp_email ?? ''} onChange={e=>update('emp_email', e.target.value)} />
        <div style={{display:'grid', gap:6}}>
          <input placeholder="Phone 1" value={form.phone_numbers[0] ?? ''} onChange={e=>{
            const arr=[...(form.phone_numbers ?? [])]; arr[0]=e.target.value; update('phone_numbers', arr);
          }} />
          <input placeholder="Phone 2" value={form.phone_numbers[1] ?? ''} onChange={e=>{
            const arr=[...(form.phone_numbers ?? [])]; arr[1]=e.target.value; update('phone_numbers', arr);
          }} />
        </div>
        <select value={form.department_id ?? ''} onChange={e=>update('department_id', e.target.value)} required>
          <option value="">Select department</option>
          {deps.map(d=> <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={form.employment_type_id ?? ''} onChange={e=>update('employment_type_id', e.target.value)} required>
          <option value="">Select employment type</option>
          {types.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={form.assigned_coordinator_id ?? ''} onChange={e=>update('assigned_coordinator_id', e.target.value)} required>
          <option value="">Assign coordinator</option>
          {coords.map(c=> <option key={c.id} value={c.id}>{c.email}</option>)}
        </select>
        <div style={{display:'flex', gap:8}}>
          <button type="submit">Save</button>
          <button type="button" onClick={remove}>Delete</button>
        </div>
        {err && <p style={{color:'crimson'}}>{err}</p>}
      </form>
    </main>
  );
}
