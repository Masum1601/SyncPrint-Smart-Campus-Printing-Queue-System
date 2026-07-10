import Link from "next/link";

const links = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Submit Print", href: "/print" },
  { label: "My Requests", href: "/my-requests" },
  { label: "Queues", href: "/queue" },
  { label: "Printer Locations", href: "/locations" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr] lg:px-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-xl font-black tracking-tight text-zinc-950 dark:text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white">
              SP
            </span>
            <span>
              Sync
              <span className="text-indigo-600 dark:text-indigo-400">
                Print
              </span>
            </span>
          </Link>
          <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            A smart campus printing queue system for faster submissions,
            transparent wait times, and better printer operations.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-zinc-600 transition hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-300"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-zinc-200 py-5 text-center text-xs text-zinc-500 dark:border-zinc-800">
        Copyright 2026 SyncPrint. Built for smarter campus printing.
      </div>
    </footer>
  );
}
