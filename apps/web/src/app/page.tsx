import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Link
        href="/admin"
        className="rounded-lg bg-violet-600 px-6 py-3 font-medium text-white"
      >
        Đi tới Admin
      </Link>
    </main>
  );
}