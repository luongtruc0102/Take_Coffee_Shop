import {
    Coffee,
    Mail,
    MapPin,
    Phone,
  } from 'lucide-react';
  
  import Link from 'next/link';
  
  export default function UserFooter() {
    return (
      <footer className="mt-6 border-t border-[#E9E1D8] bg-white">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4A2C20] text-white">
                <Coffee
                  size={18}
                />
              </div>
  
              <span className="text-lg font-bold text-[#4A2C20]">
                Take Coffee
              </span>
            </div>
  
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#78866B]">
              Thưởng thức cà phê theo cách của bạn.
              Đặt món nhanh chóng, tiện lợi và dễ dàng.
            </p>
          </div>
  
          <div>
            <h3 className="font-semibold text-[#1F1B18]">
              Khám phá
            </h3>
  
            <div className="mt-4 space-y-2 text-sm">
              <Link
                href="/"
                className="block text-[#78866B] transition hover:text-[#4A2C20]"
              >
                Trang chủ
              </Link>
  
              <Link
                href="/menu"
                className="block text-[#78866B] transition hover:text-[#4A2C20]"
              >
                Menu
              </Link>
  
              <Link
                href="/cart"
                className="block text-[#78866B] transition hover:text-[#4A2C20]"
              >
                Giỏ hàng
              </Link>
            </div>
          </div>
  
          <div>
            <h3 className="font-semibold text-[#1F1B18]">
              Liên hệ
            </h3>
  
            <div className="mt-4 space-y-3 text-sm text-[#78866B]">
              <div className="flex items-center gap-2">
                <MapPin
                  size={16}
                />
  
                Take Coffee
              </div>
  
              <div className="flex items-center gap-2">
                <Phone
                  size={16}
                />
  
                0123 456 789
              </div>
  
              <div className="flex items-center gap-2">
                <Mail
                  size={16}
                />
  
                takecoffee@gmail.com
              </div>
            </div>
          </div>
        </div>
  
        <div className="border-t border-[#E9E1D8]">
          <div className="mx-auto max-w-[1440px] px-4 py-4 text-center text-xs text-[#8A817B] sm:px-6 lg:px-8">
            © 2026 Take Coffee. All rights reserved.
          </div>
        </div>
      </footer>
    );
  }