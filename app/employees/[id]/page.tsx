'use client';
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function EmployeeDebug() {
  const { id } = useParams<{ id: string }>();
  const sb = supabaseBrowser();
  const [state, setState] = useState<any>({ status: 'loading' });

  useEffect(() => { (async () => {
    try {
      const { data: { user } } = await sb.auth.getUser();
      const email = user?.email ?? '';
      const [catRes, empRes] = await Promise.all([
        fetch('/api/catalogs', { headers: { 'x-user-email': email } }),
        fetch(`/api/employees/${id}`, { headers: { 'x-user-email': email } })
      ]);
      const cat = await catRes.json().catch(() => ({}));
      const emp = await empRes.json().catch(() => ({}));
      setState({
        status: 'done',
        email,
        id,
        catalogs: { ok: catRes.ok, status: catRes.status, body: cat },
        employee: { ok: empRes.ok, status: empRes.status, body: emp }
      });
    } catch (e:any) {
      setState({ status:'error', message: e?.message || String(e), id });
    }
  })(); }, [id, sb]);

  return <main className="container"><pre>{JSON.stringify(state, null, 2)}</pre></main>;
}
