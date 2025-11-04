'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function LoginPage() {
  const sb = supabaseBrowser();
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string>();

  async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  setErr(undefined);

  // 1) Sign in
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) { setErr(error.message); return; }

  // 2) Initialize DB session (calls /api/session → sets GUCs)
  await fetch('/api/session', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ email })
  });

  // 3) Go to dashboard
  window.location.href = '/dashboard';
}


  return (
    <main className="container" style={{maxWidth:420}}>
      <h2>Login</h2>
      <form onSubmit={onSubmit} style={{display:'grid', gap:12}}>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit">Sign in</button>
        {err && <p style={{color:'crimson'}}>{err}</p>}
      </form>
      <p style={{marginTop:12}}><Link href="/">Back home</Link></p>
    </main>
  );
}
