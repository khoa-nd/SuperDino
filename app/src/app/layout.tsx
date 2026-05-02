import type { Metadata, Viewport } from 'next';
import { Fredoka, Nunito } from 'next/font/google';
import './globals.css';

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fredoka',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'SuperDino',
  description: 'You become stronger by what you do.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SuperDino',
    startupImage: [],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f5f5dc',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
