"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { campusPrinters } from "@/lib/site-data";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Badge } from "@/components/ui/Badge";

const paperOptions = ["A4", "A3", "Letter"] as const;
const priorityOptions = ["Standard", "Express"] as const;

export function PrintJobForm() {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [copies, setCopies] = useState(1);
  const [pages, setPages] = useState(8);
  const [paperSize, setPaperSize] = useState<(typeof paperOptions)[number]>("A4");
  const [colorMode, setColorMode] = useState("Black and white");
  const [duplex, setDuplex] = useState(true);
  const [priority, setPriority] =
    useState<(typeof priorityOptions)[number]>("Standard");
  const [printer, setPrinter] = useState<string>(campusPrinters[0].name);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const estimate = useMemo(() => {
    const pageRate = colorMode === "Color" ? 8 : 3;
    const paperMultiplier = paperSize === "A3" ? 1.6 : 1;
    const priorityFee = priority === "Express" ? 25 : 0;

    return Math.round(pages * copies * pageRate * paperMultiplier + priorityFee);
  }, [colorMode, copies, pages, paperSize, priority]);

  const selectedPrinter = campusPrinters.find((item) => item.name === printer);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!fileName) {
      setError("Please choose a document before submitting.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/print-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document: fileName,
          printer,
          pages,
          copies,
          paperSize,
          colorMode,
          duplex,
          priority,
          notes,
          estimate,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        request?: { id: string };
      };

      if (!response.ok || !payload.request) {
        throw new Error(payload.error ?? "Unable to submit your print request.");
      }

      router.push(`/my-requests/${payload.request.id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your print request.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <RequireAuth
      title="Sign in to submit a print request"
      description="Print jobs are saved to your student account so you can track queue status after submission."
    >
      <section className="bg-zinc-50 py-10 dark:bg-zinc-950 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Badge>Print Submission</Badge>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
              Create a new print job
            </h1>
            <p className="mt-4 text-base leading-8 text-zinc-600 dark:text-zinc-400">
              Configure the job, pick a campus printer, review the estimate,
              and submit it to the queue.
            </p>

            <div className="mt-8 rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                Recommended printer
              </h2>
              <div className="mt-5 rounded-3xl bg-indigo-50 p-5 dark:bg-indigo-500/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-zinc-950 dark:text-white">
                      {selectedPrinter?.name}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {selectedPrinter?.location}
                    </p>
                  </div>
                  <Badge tone="emerald">{selectedPrinter?.wait}</Badge>
                </div>
                <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {selectedPrinter?.supplies}
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
          >
            <div className="grid gap-6">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                  Document
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                  onChange={(event) =>
                    setFileName(event.target.files?.[0]?.name ?? "")
                  }
                  className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-600 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
                />
                <span className="text-xs text-zinc-500">
                  Supported formats: PDF, Office documents, PNG, JPG.
                </span>
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                    Pages
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={pages}
                    onChange={(event) => setPages(Number(event.target.value))}
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                    Copies
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={copies}
                    onChange={(event) => setCopies(Number(event.target.value))}
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                    Paper size
                  </span>
                  <select
                    value={paperSize}
                    onChange={(event) =>
                      setPaperSize(event.target.value as typeof paperSize)
                    }
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    {paperOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                    Printer
                  </span>
                  <select
                    value={printer}
                    onChange={(event) => setPrinter(event.target.value)}
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    {campusPrinters.map((item) => (
                      <option key={item.name}>{item.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {["Black and white", "Color"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setColorMode(mode)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                      colorMode === mode
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                        : "border-zinc-200 text-zinc-700 hover:border-indigo-200 dark:border-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setDuplex((current) => !current)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                    duplex
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                      : "border-zinc-200 text-zinc-700 hover:border-indigo-200 dark:border-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  Duplex {duplex ? "on" : "off"}
                </button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                    Priority
                  </span>
                  <select
                    value={priority}
                    onChange={(event) =>
                      setPriority(event.target.value as typeof priority)
                    }
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                    Estimated total
                  </p>
                  <p className="mt-2 text-3xl font-black text-zinc-950 dark:text-white">
                    BDT {estimate}
                  </p>
                </div>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                  Notes for print desk
                </span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  placeholder="Example: print slides 2 per page, keep for department pickup."
                  className="resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>

              {error ? (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "Submit to queue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
    </RequireAuth>
  );
}
