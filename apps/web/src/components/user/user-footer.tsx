import {
    Mail,
    MapPin,
    Phone,
  } from 'lucide-react';
  
  import Link from 'next/link';
  import BrandLogo from '@/components/brand/brand-logo';
  
  export default function UserFooter() {
    return (
      <footer className="mt-6 border-t border-[#E9E1D8] bg-white">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <BrandLogo
              variant="horizontalFull"
              sizes="190px"
              className="h-auto w-[190px]"
            />
  
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#78866B]">
              Mỗi ngày một vị vui. Đặt cà phê và trà
              nhanh chóng, tiện lợi theo cách của bạn.
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
  
                Kippora Coffee & Tea
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
  
                kippora.coffee@gmail.com
              </div>
            </div>
          </div>
        </div>
  
        <div className="border-t border-[#E9E1D8]">
          <div className="mx-auto max-w-[1440px] px-4 py-4 text-center text-xs text-[#8A817B] sm:px-6 lg:px-8">
            © 2026 Kippora. All rights reserved.
          </div>
        </div>
      </footer>
    );
  }