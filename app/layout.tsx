import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dokuntag - Loyalty System',
  description: 'Turkish loyalty and rewards management system',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        {children}
      </body>
    </html>
  );
}
