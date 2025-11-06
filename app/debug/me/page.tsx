'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function Me() {
  const sb = supabaseBrowser();
  const [out, setOut] = useState<any>();
  useEffect(() => { (async () => {
    const { data: { user } } = await sb.auth.getUser();
    const res = await fetch('/api/whoami', { headers: { 'x-user-email': user?.email ?? '' } });
    setOut(await res.json());
  })(); }, []);
  return <pre>{JSON.stringify(out, null, 2)}</pre>;
}
