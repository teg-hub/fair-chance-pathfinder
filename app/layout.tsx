import './globals.css';
import Link from 'next/link';

export const metadata = { title: 'Fair Chance', description: 'FCE Support' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
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
      </body>
    </html>
  );
}
