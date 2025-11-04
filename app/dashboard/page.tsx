// app/dashboard/page.tsx
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function Dashboard() {
  const admin = supabaseAdmin();
  // TODO: derive from logged-in user; temporary values:
  const ORG = process.env.NEXT_PUBLIC_DEMO_ORG_ID!;  // set this in Vercel for now
  const ROLE: 'admin'|'coordinator'|'read_only'|'platform_super_admin' = 'admin';
  const USER = process.env.NEXT_PUBLIC_DEMO_USER_ID!; // set this in Vercel for now

  const today = new Date();
  const from = new Date(today); from.setDate(from.getDate()-30);
  const { data, error } = await admin.rpc('dashboard_overview', {
    p_org: ORG, p_role: ROLE, p_user: USER,
    p_from: from.toISOString().slice(0,10), p_to: today.toISOString().slice(0,10), p_granularity: 'month'
  });
  if (error) return <main className="container"><h2>Dashboard</h2><p>Error: {error.message}</p></main>;

  return (
    <main className="container">
      <h2>Dashboard</h2>
      <ul>{data?.map((r:any)=><li key={r.metric}>{r.metric}: {r.value}</li>)}</ul>
    </main>
  );
}
