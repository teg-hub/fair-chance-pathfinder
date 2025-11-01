// app/page.tsx
import Link from 'next/link';
export default function Home() {
  return (
    <main className="container">
      <h1>Welcome to Fair Chance</h1>
      <p><Link href="/auth/login">Go to Login</Link></p>
    </main>
  );
}
