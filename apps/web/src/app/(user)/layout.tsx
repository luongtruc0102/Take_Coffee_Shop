import UserFooter from '@/components/user/user-footer';
import UserHeader from '@/components/user/user-header';

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // overflow-x-clip chặn tràn ngang mà không tạo scroll container làm hỏng sticky.
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-clip bg-[#FAF8F5]">
      <UserHeader />

      {/* Bù chiều cao header fixed để nội dung không bị che. */}
      <main className="relative min-w-0 flex-1 pt-16">
        {children}
      </main>

      <UserFooter />
    </div>
  );
}