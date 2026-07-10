"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PrintRequest } from "@/lib/print-requests/types";
import { PrintRequestCard } from "@/components/print-requests/PrintRequestCard";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function MyPrintRequests() {
  const [requests, setRequests] = useState<PrintRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRequests() {
      try {
        const response = await fetch("/api/print-requests");

        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error ?? "Unable to load your print requests.");
        }

        const payload = (await response.json()) as { requests: PrintRequest[] };
        setRequests(payload.requests);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load your print requests.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadRequests();
  }, []);

  return (
    <section className="bg-zinc-50 py-10 dark:bg-zinc-950 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge>My Requests</Badge>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
              Your submitted print requests
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-600 dark:text-zinc-400">
              Review every job you have submitted, then open any request to
              track its current queue status.
            </p>
          </div>
          <ButtonLink href="/print">Submit new request</ButtonLink>
        </div>

        {isLoading ? (
          <div className="mt-10 grid gap-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-[2rem] bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        ) : null}

        {error ? (
          <p className="mt-10 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        ) : null}

        {!isLoading && !error && requests.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-white">
              No print requests yet
            </h2>
            <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              Submit your first document to start tracking queue status from
              your dashboard.
            </p>
            <div className="mt-6">
              <ButtonLink href="/print">Submit print request</ButtonLink>
            </div>
          </div>
        ) : null}

        {!isLoading && !error && requests.length > 0 ? (
          <div className="mt-10 grid gap-5">
            {requests.map((request) => (
              <PrintRequestCard key={request.id} request={request} />
            ))}
          </div>
        ) : null}

        {!isLoading && !error && requests.length > 0 ? (
          <p className="mt-8 text-center text-sm text-zinc-500">
            Need another copy?{" "}
            <Link href="/print" className="font-semibold text-indigo-600">
              Submit a new print request
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
