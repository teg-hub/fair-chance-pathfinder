import Link from 'next/link';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container">
      <nav style={{ display:'flex', gap:12, justifyContent:'space-between' }}>
        <div>
          <Link href="/dashboard">Dashboard</Link>{' '}|{' '}
          <Link href="/employees">Employees</Link>{' '}|{' '}
          <Link href="/admin">Admin</Link>
        </div>
        <a href="/auth/login">Logout</a>
      </nav>
      <div style={{ marginTop:16 }}>{children}</div>
    </div>
  );
}
