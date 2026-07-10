"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PrintRequest } from "@/lib/print-requests/types";
import {
  formatSubmittedAt,
  getStatusStepIndex,
  statusSteps,
  statusTone,
} from "@/lib/print-requests/utils";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";

type PrintRequestStatusViewProps = {
  requestId: string;
};

export function PrintRequestStatusView({
  requestId,
}: PrintRequestStatusViewProps) {
  const [request, setRequest] = useState<PrintRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRequest() {
      try {
        const response = await fetch(`/api/print-requests/${requestId}`);

        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error ?? "Unable to load this print request.");
        }

        const payload = (await response.json()) as { request: PrintRequest };
        setRequest(payload.request);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this print request.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadRequest();
  }, [requestId]);

  if (isLoading) {
    return (
      <section className="bg-zinc-50 py-10 dark:bg-zinc-950 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="h-96 animate-pulse rounded-[2rem] bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </section>
    );
  }

  if (error || !request) {
    return (
      <section className="bg-zinc-50 py-10 dark:bg-zinc-950 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              {error || "Print request not found."}
            </p>
            <div className="mt-6">
              <ButtonLink href="/my-requests" variant="secondary">
                Back to my requests
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentStep = getStatusStepIndex(request.status);

  return (
    <section className="bg-zinc-50 py-10 dark:bg-zinc-950 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/my-requests"
          className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-500"
        >
          Back to my requests
        </Link>

        <div className="mt-6 rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-400">
                {request.id}
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
                {request.document}
              </h1>
              <p className="mt-3 text-sm text-zinc-500">
                Submitted {formatSubmittedAt(request.submittedAt)}
              </p>
            </div>
            <Badge tone={statusTone(request.status)}>{request.status}</Badge>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
                Printer
              </p>
              <p className="mt-2 font-bold text-zinc-950 dark:text-white">
                {request.printer}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {request.printerLocation}
              </p>
            </div>
            <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
                ETA
              </p>
              <p className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">
                {request.eta}
              </p>
            </div>
            <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
                Progress
              </p>
              <p className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">
                {request.progress}%
              </p>
            </div>
          </div>

          <div className="mt-8 h-3 rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-3 rounded-full bg-indigo-600 transition-all"
              style={{ width: `${request.progress}%` }}
            />
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {statusSteps.map((step, index) => {
              const isActive = currentStep >= index;
              const isCurrent = request.status === step;

              return (
                <div
                  key={step}
                  className={`rounded-2xl border p-4 ${
                    isCurrent
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                      : isActive
                        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                        : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
                    Step {index + 1}
                  </p>
                  <p className="mt-2 font-bold text-zinc-950 dark:text-white">
                    {step}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <DetailItem label="Pages" value={String(request.pages)} />
            <DetailItem label="Copies" value={String(request.copies)} />
            <DetailItem label="Paper size" value={request.paperSize} />
            <DetailItem label="Color mode" value={request.colorMode} />
            <DetailItem label="Duplex" value={request.duplex ? "On" : "Off"} />
            <DetailItem label="Priority" value={request.priority} />
            <DetailItem label="Estimated cost" value={`BDT ${request.estimate}`} />
            <DetailItem label="Submitted by" value={request.ownerName} />
          </div>

          {request.notes ? (
            <div className="mt-8 rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-950">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
                Notes
              </p>
              <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                {request.notes}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-100 p-4 dark:border-zinc-800">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>
      <p className="mt-2 font-semibold text-zinc-950 dark:text-white">{value}</p>
    </div>
  );
}
