// app/auth/signup/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function SignupPage() {
  const sb = supabaseBrowser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(undefined);
    const { error } = await sb.auth.signUp({ email, password });
    if (error) setErr(error.message);
    else window.location.href = '/auth/login';
  }

  return (
    <main className="container" style={{ maxWidth: 420 }}>
      <h2>Create account</h2>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit">Sign up</button>
        {err && <p style={{ color: 'crimson' }}>{err}</p>}
      </form>
      <p style={{ marginTop: 12 }}>
        Have an account? <Link href="/auth/login">Sign in</Link>
      </p>
    </main>
  );
}
