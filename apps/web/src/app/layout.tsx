import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'KipporaCoffee',
    template: '%s | Kippora',
  },
  description: 'Kippora Coffee & Tea - Mỗi ngày một vị vui.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}