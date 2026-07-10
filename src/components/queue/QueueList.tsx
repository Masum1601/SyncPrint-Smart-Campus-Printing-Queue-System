"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";

type QueueRequest = {
  id: string;
  document: string;
  printer: string;
  status: string;
  pages: number;
  eta: string;
  progress: number;
  ownerName: string;
  submittedAt: string;
};

export function QueueList() {
  const [requests, setRequests] = useState<QueueRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadQueue() {
      try {
        const response = await fetch("/api/queue");
        const payload = (await response.json()) as { requests?: QueueRequest[] };

        if (!response.ok || !payload.requests) {
          throw new Error("Unable to load the current queue.");
        }

        if (isMounted) {
          setRequests(payload.requests);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load the current queue.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadQueue();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleCollect(id: string) {
    setBusyId(id);

    try {
      const response = await fetch(`/api/queue?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to remove the print job.");
      }

      setRequests((current) => current.filter((item) => item.id !== id));
    } catch (collectError) {
      setError(
        collectError instanceof Error
          ? collectError.message
          : "Unable to remove the print job.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="bg-zinc-50 py-12 dark:bg-zinc-950 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              Queue Status
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
              Current print queue
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-600 dark:text-zinc-400">
              Every active print request appears here. Mark a job as collected to
              remove it from the database once the student has picked it up.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            {loading ? "Loading queue..." : `${requests.length} active jobs`}
          </div>
        </div>

        {error ? (
          <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        ) : null}

        <div className="mt-8 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-xl shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid border-b border-zinc-200 bg-zinc-50 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-[1.2fr_0.8fr_0.6fr_0.5fr_0.6fr_auto]">
            <span>Document</span>
            <span className="hidden md:block">Printer</span>
            <span className="hidden md:block">Pages</span>
            <span className="hidden md:block">Status</span>
            <span className="hidden md:block text-right">ETA</span>
            <span className="hidden md:block text-right">Action</span>
          </div>

          <div>
            {requests.map((request) => (
              <article
                key={request.id}
                className="grid gap-4 border-b border-zinc-100 px-6 py-5 last:border-0 dark:border-zinc-800 md:grid-cols-[1.2fr_0.8fr_0.6fr_0.5fr_0.6fr_auto] md:items-center"
              >
                <div>
                  <p className="font-bold text-zinc-950 dark:text-white">
                    {request.document}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {request.id} - {request.ownerName}
                  </p>
                </div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {request.printer}
                </p>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {request.pages}
                </p>
                <div>
                  <Badge
                    tone={
                      request.status === "Ready"
                        ? "emerald"
                        : request.status === "Printing"
                          ? "indigo"
                          : "amber"
                    }
                  >
                    {request.status}
                  </Badge>
                  <div className="mt-3 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-2 rounded-full bg-indigo-600"
                      style={{ width: `${request.progress}%` }}
                    />
                  </div>
                </div>
                <p className="font-bold text-zinc-950 dark:text-white md:text-right">
                  {request.eta}
                </p>
                <button
                  type="button"
                  onClick={() => void handleCollect(request.id)}
                  disabled={busyId === request.id}
                  className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  {busyId === request.id ? "Removing..." : "Mark as collected"}
                </button>
              </article>
            ))}

            {!requests.length && !loading ? (
              <div className="px-6 py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
                No active queue items right now.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}