import type { Metadata } from 'next';
import { Nunito, Quicksand } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
  display: 'swap',
});

const quicksand = Quicksand({
  subsets: ['vietnamese', 'latin'],
  weight: ['500', '600', '700'],
  variable: '--font-quicksand',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GVBM Platform - Classroom Management & Gamification for English Teachers',
  description:
    'Nền tảng quản lý lớp học và thi đua gamification chuyên biệt dành cho giáo viên tiếng Anh với cơ chế 1 chạm, máy chiếu tương tác, Excel wizard và báo cáo PDF.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`dark ${nunito.variable} ${quicksand.variable}`}
    >
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
