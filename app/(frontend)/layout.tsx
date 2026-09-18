import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { TrackedLink } from '@/components/TrackedLink';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'A slower internet',
  description: 'Minimal editorial writing, notes, and product thinking.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL || 'http://localhost:3001/script.js';
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || process.env.UMAMI_WEBSITE_ID || 'site-portfolio';

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        {websiteId ? (
          <script
            async
            defer
            src={umamiUrl}
            data-website-id={websiteId}
          />
        ) : null}
      </head>
      <body className="min-h-screen bg-stone-50 text-zinc-800 antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between border-b border-zinc-200 py-5">
            <TrackedLink href="/" eventName="navigation_click" eventProperties={{ destination: 'home', location: 'header' }} className="text-sm font-medium uppercase tracking-[0.22em] text-zinc-900">
              A slower internet
            </TrackedLink>
            <nav className="hidden items-center gap-6 text-sm text-zinc-600 sm:flex">
              <TrackedLink href="/" eventName="navigation_click" eventProperties={{ destination: 'home', location: 'header' }} className="transition hover:text-zinc-900">Home</TrackedLink>
              <TrackedLink href="/blog" eventName="navigation_click" eventProperties={{ destination: 'journal', location: 'header' }} className="transition hover:text-zinc-900">Journal</TrackedLink>
              <TrackedLink href="/#newsletter" eventName="navigation_click" eventProperties={{ destination: 'newsletter', location: 'header' }} className="transition hover:text-zinc-900">Newsletter</TrackedLink>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
