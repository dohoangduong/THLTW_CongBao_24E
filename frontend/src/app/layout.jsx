import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Bảo Công Studio | Hệ thống bán lẻ Điện thoại & Phụ kiện Chính hãng",
  description: "Hệ thống bán lẻ điện thoại thông minh, máy tính bảng và phụ kiện công nghệ chính hãng hàng đầu Việt Nam.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

