import { promises as fs } from "fs";
import path from "path";
import { campusPrinters } from "@/lib/site-data";
import type {
  CreatePrintRequestInput,
  PrintRequest,
  PrintRequestStatus,
} from "@/lib/print-requests/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "print-requests.json");

let requestCounter = 1000;

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  }
}

async function readAll(): Promise<PrintRequest[]> {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  const parsed = JSON.parse(raw) as PrintRequest[];

  for (const request of parsed) {
    const numericId = Number(request.id.replace("SP-", ""));
    if (!Number.isNaN(numericId) && numericId >= requestCounter) {
      requestCounter = numericId + 1;
    }
  }

  return parsed;
}

async function writeAll(requests: PrintRequest[]) {
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(requests, null, 2), "utf-8");
}

function createId() {
  const id = `SP-${requestCounter}`;
  requestCounter += 1;
  return id;
}

function getPrinterLocation(printerName: string) {
  return (
    campusPrinters.find((printer) => printer.name === printerName)?.location ??
    "Campus printer"
  );
}

function getInitialEta(printerName: string) {
  return (
    campusPrinters.find((printer) => printer.name === printerName)?.wait ??
    "15 min"
  );
}

function deriveStatus(progress: number): PrintRequestStatus {
  if (progress >= 100) {
    return "Ready";
  }

  if (progress >= 35) {
    return "Printing";
  }

  return "Queued";
}

function applyStatusProgress(
  request: PrintRequest,
  minutesSinceSubmit: number,
): PrintRequest {
  if (request.status === "Collected" || request.status === "Cancelled") {
    return request;
  }

  const simulatedProgress = Math.min(
    100,
    12 + minutesSinceSubmit * 18 + (request.priority === "Express" ? 10 : 0),
  );
  const status = deriveStatus(simulatedProgress);
  const eta =
    status === "Ready"
      ? "Now"
      : status === "Printing"
        ? `${Math.max(1, 12 - minutesSinceSubmit)} min`
        : getInitialEta(request.printer);

  return {
    ...request,
    status,
    progress: simulatedProgress,
    eta,
    updatedAt: new Date().toISOString(),
  };
}

function withLiveStatus(request: PrintRequest): PrintRequest {
  const minutesSinceSubmit =
    (Date.now() - new Date(request.submittedAt).getTime()) / 60000;

  return applyStatusProgress(request, minutesSinceSubmit);
}

export async function listPrintRequestsByUser(
  userId: string,
): Promise<PrintRequest[]> {
  const requests = await readAll();

  return requests
    .filter((request) => request.userId === userId)
    .map(withLiveStatus)
    .sort(
      (left, right) =>
        new Date(right.submittedAt).getTime() -
        new Date(left.submittedAt).getTime(),
    );
}

export async function getPrintRequestForUser(
  id: string,
  userId: string,
): Promise<PrintRequest | null> {
  const requests = await readAll();
  const request = requests.find(
    (item) => item.id === id && item.userId === userId,
  );

  return request ? withLiveStatus(request) : null;
}

export async function createPrintRequest(
  input: CreatePrintRequestInput,
  userId: string,
  ownerName: string,
): Promise<PrintRequest> {
  const requests = await readAll();
  const now = new Date().toISOString();

  const request: PrintRequest = {
    ...input,
    id: createId(),
    userId,
    ownerName,
    printerLocation: getPrinterLocation(input.printer),
    status: "Queued",
    progress: 12,
    eta: getInitialEta(input.printer),
    submittedAt: now,
    updatedAt: now,
  };

  requests.push(request);
  await writeAll(requests);

  return withLiveStatus(request);
}
