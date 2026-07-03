import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SyncPrint - Smart Campus Printing Queue System",
  description: "Efficiently manage campus printing jobs and queues.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <ClerkProvider>
          <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-8">
                <a href="/" className="flex items-center gap-2 font-sans font-bold text-xl tracking-tight text-zinc-900 dark:text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-black shadow-lg shadow-indigo-500/20">S</span>
                  <span>Sync<span className="text-indigo-600 dark:text-indigo-400">Print</span></span>
                </a>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Queue Status</a>
                  <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Print Job</a>
                  <a href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Locations</a>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button className="text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors cursor-pointer">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 hover:shadow-indigo-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all cursor-pointer">
                      Sign up
                    </button>
                  </SignUpButton>
                </Show>
                <Show when="signed-in">
                  <UserButton />
                </Show>
              </div>
            </div>
          </header>
          <div className="flex flex-col flex-1">
            {children}
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
