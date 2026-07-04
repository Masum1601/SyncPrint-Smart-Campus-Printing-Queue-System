import Link from "next/link";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

const variants = {
  primary:
    "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500",
  secondary:
    "border border-zinc-200 bg-white text-zinc-900 shadow-sm hover:border-indigo-200 hover:bg-indigo-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:border-indigo-500/40 dark:hover:bg-indigo-950/40",
  ghost:
    "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
