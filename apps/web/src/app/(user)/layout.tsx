import UserFooter from '@/components/user/user-footer';
import UserHeader from '@/components/user/user-header';

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#FAF8F5]">
      <UserHeader />

      <main className="relative min-w-0 flex-1">
        {children}
      </main>

      <UserFooter />
    </div>
  );
}