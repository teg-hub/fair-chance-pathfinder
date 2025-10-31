import Link from 'next/link';
export default function Home() {
  return (
    <main className="container">
      <h1>Welcome to Fair Chance</h1>
      <p>Proceed to <Link href="/auth/login">Login</Link></p>
    </main>
  );
}
