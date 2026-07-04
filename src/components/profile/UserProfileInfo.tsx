"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";

type UserProfileInfoProps = {
  variant?: "compact" | "full";
};

function getDisplayName(
  fullName: string | null | undefined,
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  username: string | null | undefined,
) {
  if (fullName) {
    return fullName;
  }

  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (name) {
    return name;
  }

  return username ?? "User";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserProfileInfo({ variant = "compact" }: UserProfileInfoProps) {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return (
      <div
        className={`animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800 ${
          variant === "full" ? "h-20 w-full" : "h-10 w-36"
        }`}
      />
    );
  }

  if (!user) {
    return null;
  }

  const displayName = getDisplayName(
    user.fullName,
    user.firstName,
    user.lastName,
    user.username,
  );
  const email = user.primaryEmailAddress?.emailAddress ?? "No email linked";
  const initials = getInitials(displayName);

  return (
    <div
      className={`flex items-center gap-3 ${
        variant === "full"
          ? "w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
          : "rounded-full border border-zinc-200 bg-white py-1.5 pl-1.5 pr-4 dark:border-zinc-800 dark:bg-zinc-900"
      }`}
    >
      {user.imageUrl ? (
        <Image
          src={user.imageUrl}
          alt={displayName}
          width={variant === "full" ? 48 : 36}
          height={variant === "full" ? 48 : 36}
          className={`rounded-full object-cover ${
            variant === "full" ? "h-12 w-12" : "h-9 w-9"
          }`}
        />
      ) : (
        <span
          className={`flex items-center justify-center rounded-full bg-indigo-600 font-bold text-white ${
            variant === "full" ? "h-12 w-12 text-base" : "h-9 w-9 text-sm"
          }`}
        >
          {initials}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-zinc-950 dark:text-white">
          {displayName}
        </p>
        <p
          className={`truncate text-zinc-500 dark:text-zinc-400 ${
            variant === "full" ? "text-sm" : "text-xs"
          }`}
        >
          {email}
        </p>
      </div>

      {variant === "full" ? (
        <SignOutButton>
          <button
            type="button"
            className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Sign out
          </button>
        </SignOutButton>
      ) : null}
    </div>
  );
}
