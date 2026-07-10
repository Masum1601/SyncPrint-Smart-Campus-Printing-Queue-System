"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PDFDocument } from "pdf-lib";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Badge } from "@/components/ui/Badge";
import { printPrinters, type PrintPrinterCode } from "@/lib/print-requests/printers";

type PrinterQueueItem = {
  code: PrintPrinterCode;
  remainingPages: number;
  updatedAt: string;
};

type BalanceState = {
  balanceUnits: number;
  balance: number;
  updatedAt: string;
};

type SubmitResponse = {
  error?: string;
  request?: {
    id: string;
    printer: string;
    pages: number;
    estimate: number;
    printerRemainingPages?: number;
    balanceUnitsRemaining?: number;
    updatedAt: string;
  };
};

type BalanceResponse = {
  error?: string;
  balance?: BalanceState;
};

const colorModes = ["Black and white", "Color"] as const;

function formatTakaFromUnits(units: number) {
  const amount = units / 2;
  return Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(1);
}

function getPricePerPageUnits(
  colorMode: (typeof colorModes)[number],
  duplex: boolean,
) {
  return colorMode === "Color" ? (duplex ? 6 : 4) : duplex ? 4 : 3;
}

export function PrintJobForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [copies, setCopies] = useState(1);
  const [colorMode, setColorMode] = useState<(typeof colorModes)[number]>(
    "Black and white",
  );
  const [duplex, setDuplex] = useState(true);
  const [printer, setPrinter] = useState<PrintPrinterCode>(printPrinters[0]);
  const [printers, setPrinters] = useState<PrinterQueueItem[]>([]);
  const [balance, setBalance] = useState<BalanceState | null>(null);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTopingUp, setIsTopingUp] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(true);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadPrinters() {
      try {
        const response = await fetch("/api/printers");
        const payload = (await response.json()) as {
          printers?: PrinterQueueItem[];
        };

        const fetchedPrinters = payload.printers ?? [];

        if (!response.ok || !fetchedPrinters.length) {
          throw new Error("Unable to load printer availability.");
        }

        if (!isMounted) {
          return;
        }

        setPrinters(fetchedPrinters);
        setPrinter((current): PrintPrinterCode =>
          fetchedPrinters.some((item) => item.code === current)
            ? current
            : fetchedPrinters[0]?.code ?? printPrinters[0],
        );
      } catch {
        if (isMounted) {
          setPrinters(
            printPrinters.map((code) => ({
              code,
              remainingPages: 0,
              updatedAt: new Date().toISOString(),
            })),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingPrinters(false);
        }
      }
    }

    void loadPrinters();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadBalance() {
      try {
        const response = await fetch("/api/balance");
        const payload = (await response.json()) as BalanceResponse;

        if (!response.ok || !payload.balance) {
          throw new Error(payload.error ?? "Unable to load your balance.");
        }

        if (isMounted) {
          setBalance(payload.balance);
        }
      } catch {
        if (isMounted) {
          setBalance(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingBalance(false);
        }
      }
    }

    void loadBalance();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setNotice(""), 4500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const pricePerPageUnits = getPricePerPageUnits(colorMode, duplex);
  const estimatedUnits = pageCount > 0 ? pageCount * copies * pricePerPageUnits : 0;
  const estimatedBalance = balance ? balance.balanceUnits - estimatedUnits : null;

  async function handleFileChange(file: File | null) {
    setSelectedFile(file);
    setPageCount(0);

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      return;
    }

    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      setPageCount(pdf.getPageCount());
    } catch {
      setError("Unable to read the PDF page count.");
      setSelectedFile(null);
    }
  }

  async function refreshBalance() {
    const response = await fetch("/api/balance");
    const payload = (await response.json()) as BalanceResponse;

    if (response.ok && payload.balance) {
      setBalance(payload.balance);
    }
  }

  async function handleTopUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(topUpAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid balance amount.");
      return;
    }

    setError("");
    setIsTopingUp(true);

    try {
      const response = await fetch("/api/balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      const payload = (await response.json()) as BalanceResponse;

      if (!response.ok || !payload.balance) {
        throw new Error(payload.error ?? "Unable to add balance.");
      }

      setBalance(payload.balance);
      setTopUpAmount("");
      setNotice(`Balance added successfully. New balance: BDT ${formatTakaFromUnits(payload.balance.balanceUnits)}.`);
    } catch (balanceError) {
      setError(
        balanceError instanceof Error
          ? balanceError.message
          : "Unable to add balance.",
      );
    } finally {
      setIsTopingUp(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please choose a PDF document before submitting.");
      return;
    }

    if (!pageCount) {
      setError("Please select a valid PDF before submitting.");
      return;
    }

    if (balance && balance.balanceUnits < estimatedUnits) {
      setError("Insufficient balance. Please add balance first.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("document", selectedFile);
      formData.append("printer", printer);
      formData.append("copies", String(copies));
      formData.append("colorMode", colorMode);
      formData.append("duplex", String(duplex));

      const response = await fetch("/api/print-requests", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as SubmitResponse;

      if (!response.ok || !payload.request) {
        throw new Error(payload.error ?? "Unable to submit your print request.");
      }

      setPrinters((current) =>
        current.map((item) =>
          item.code === payload.request?.printer
            ? {
                ...item,
                remainingPages:
                  payload.request.printerRemainingPages ?? item.remainingPages,
                updatedAt: payload.request.updatedAt,
              }
            : item,
        ),
      );
      if (payload.request.balanceUnitsRemaining !== undefined) {
        setBalance({
          balanceUnits: payload.request.balanceUnitsRemaining,
          balance: payload.request.balanceUnitsRemaining / 2,
          updatedAt: payload.request.updatedAt,
        });
      } else {
        await refreshBalance();
      }
      setNotice(
        `Queued ${payload.request.pages} PDF pages. Your balance is now BDT ${formatTakaFromUnits(payload.request.balanceUnitsRemaining ?? 0)}.`,
      );
      setSelectedFile(null);
      setPageCount(0);
      setCopies(1);
      setColorMode("Black and white");
      setDuplex(true);
      setFileInputKey((current) => current + 1);
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
            <div className="space-y-6">
              <div>
                <Badge>Print Submission</Badge>
                <h1 className="mt-4 text-4xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
                  Create a new PDF print job
                </h1>
                <p className="mt-4 text-base leading-8 text-zinc-600 dark:text-zinc-400">
                  Upload a PDF, count the pages automatically, and calculate the
                  price live before you submit. The server stores the file,
                  deducts your balance, and updates the printer page pool.
                </p>
              </div>

              <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                    Live printer pages
                  </h2>
                  <Badge tone="emerald">
                    {isLoadingPrinters ? "Loading" : "SQLite"}
                  </Badge>
                </div>
                <div className="mt-5 grid gap-3">
                  {printers.map((item) => (
                    <div
                      key={item.code}
                      className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-950"
                    >
                      <div>
                        <p className="font-bold text-zinc-950 dark:text-white">
                          {item.code}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Updated {new Date(item.updatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-sm font-bold text-indigo-700 dark:text-indigo-300">
                        {item.remainingPages} pages left
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                    User balance
                  </h2>
                  <Badge tone="indigo">
                    {isLoadingBalance ? "Loading" : "Active"}
                  </Badge>
                </div>
                <div className="mt-4 rounded-3xl bg-zinc-50 p-4 dark:bg-zinc-950">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                    Current balance
                  </p>
                  <p className="mt-2 text-3xl font-black text-zinc-950 dark:text-white">
                    BDT {balance ? formatTakaFromUnits(balance.balanceUnits) : "0"}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {balance ? "Updated from sqlite" : "Add balance to submit jobs."}
                  </p>
                </div>

                <form onSubmit={handleTopUp} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={topUpAmount}
                    onChange={(event) => setTopUpAmount(event.target.value)}
                    placeholder="Add balance"
                    className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                  <button
                    type="submit"
                    disabled={isTopingUp}
                    className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
                  >
                    {isTopingUp ? "Adding..." : "Add balance"}
                  </button>
                </form>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
            >
              <div className="grid gap-6">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                    PDF document
                  </span>
                  <input
                    key={fileInputKey}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(event) => void handleFileChange(event.target.files?.[0] ?? null)}
                    className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-600 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
                  />
                  <span className="text-xs text-zinc-500">
                    PDF only. The page count is read directly from the document.
                  </span>
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
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
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                      Printer
                    </span>
                    <select
                      value={printer}
                      onChange={(event) =>
                        setPrinter(event.target.value as PrintPrinterCode)
                      }
                      className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-zinc-700 dark:bg-zinc-950"
                    >
                      {printPrinters.map((code) => {
                        const printerItem = printers.find(
                          (item) => item.code === code,
                        );

                        return (
                          <option key={code} value={code}>
                            {code}
                            {printerItem ? ` - ${printerItem.remainingPages} left` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {colorModes.map((mode) => (
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
                  <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                      PDF pages
                    </p>
                    <p className="mt-2 text-3xl font-black text-zinc-950 dark:text-white">
                      {pageCount || "-"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                      Estimated price
                    </p>
                    <p className="mt-2 text-3xl font-black text-zinc-950 dark:text-white">
                      BDT {formatTakaFromUnits(estimatedUnits)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Balance after submit: BDT {estimatedBalance !== null ? formatTakaFromUnits(estimatedBalance) : "-"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                    Price guide
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    B/W: 1.5tk per page for one side, 2tk per page for both
                    sides. Color: 2tk per page for one side, 3tk per page for
                    both sides.
                  </p>
                </div>

                {error ? (
                  <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting || (balance ? balance.balanceUnits < estimatedUnits : false)}
                  className="rounded-full bg-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Submitting..." : "Submit to queue"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {notice ? (
          <div className="fixed right-4 top-4 z-50 max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-950/10 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            {notice}
          </div>
        ) : null}
      </section>
    </RequireAuth>
  );
}