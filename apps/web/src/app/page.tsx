import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Link
        href="/login"
        className="rounded-lg bg-violet-600 px-6 py-3 font-medium text-white"
      >
        Đăng nhập
      </Link>
    </main>
  );
}