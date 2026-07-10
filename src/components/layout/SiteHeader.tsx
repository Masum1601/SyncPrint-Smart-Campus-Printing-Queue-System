"use client";

import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Print Job", href: "/print" },
  { label: "My Requests", href: "/my-requests" },
  { label: "Queue Status", href: "/queue" },
  { label: "Locations", href: "/locations" },
];

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 font-sans text-xl font-black tracking-tight text-zinc-950 dark:text-white"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
        SP
      </span>
      <span>
        Sync<span className="text-indigo-600 dark:text-indigo-400">Print</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/85 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => {
              const active =
                pathname === item.href ||
                (item.href === "/my-requests" &&
                  pathname.startsWith("/my-requests"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500">
                Create account
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/print"
              className="rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              New print job
            </Link>
            <UserButton />
          </Show>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 px-4 text-zinc-700 lg:hidden dark:border-zinc-800 dark:text-zinc-200"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          <span className="text-sm font-black leading-none">
            {isOpen ? "Close" : "Menu"}
          </span>
        </button>
      </div>

      {isOpen ? (
        <div className="border-t border-zinc-200 bg-white px-4 py-4 shadow-xl lg:hidden dark:border-zinc-800 dark:bg-zinc-950">
          <nav className="grid gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="flex-1 rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-800 dark:border-zinc-800 dark:text-zinc-100">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="flex-1 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white">
                  Sign up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link
                href="/print"
                onClick={() => setIsOpen(false)}
                className="flex-1 rounded-full bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                New print job
              </Link>
              <UserButton />
            </Show>
          </div>
        </div>
      ) : null}
    </header>
  );
}
