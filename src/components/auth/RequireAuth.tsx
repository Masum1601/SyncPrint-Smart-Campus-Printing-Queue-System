"use client";

import { Show, SignInButton } from "@clerk/nextjs";

type RequireAuthProps = {
  children: React.ReactNode;
  title: string;
  description: string;
};

export function RequireAuth({ children, title, description }: RequireAuthProps) {
  return (
    <>
      <Show when="signed-out">
        <section className="bg-zinc-50 py-20 dark:bg-zinc-950">
          <div className="mx-auto max-w-xl rounded-[2rem] border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h1 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
              {title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              {description}
            </p>
            <SignInButton mode="modal">
              <button
                type="button"
                className="mt-8 rounded-full bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
              >
                Sign in to continue
              </button>
            </SignInButton>
          </div>
        </section>
      </Show>
      <Show when="signed-in">{children}</Show>
    </>
  );
}
