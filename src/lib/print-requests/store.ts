import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { isPrintPrinterCode, printPrinters } from "./printers";
import type {
  CreatePrintRequestInput,
  PrinterQueueItem,
  PrintRequest,
  PrintRequestStatus,
} from "./types";

sqlite3.verbose();

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "printsync.sqlite");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const INITIAL_BALANCE_UNITS = 1000;

type DatabaseClient = Awaited<ReturnType<typeof open>>;
type PrinterRow = {
  printer_code: string;
  remaining_pages: number;
  updated_at: string;
};
type PrintRequestRow = {
  id: string;
  user_id: string;
  owner_name: string;
  document: string;
  stored_file_name: string;
  stored_file_path: string;
  printer: string;
  pages: number;
  copies: number;
  color_mode: "Black and white" | "Color";
  duplex: number;
  estimate: number;
  printer_location: string;
  status: PrintRequestStatus;
  progress: number;
  eta: string;
  submitted_at: string;
  updated_at: string;
};
type BalanceRow = {
  user_id: string;
  balance_units: number;
  updated_at: string;
};

let databasePromise: ReturnType<typeof open> | null = null;

function randomBetween(minimum: number, maximum: number) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function sanitizeFileName(fileName: string) {
  const trimmed = path.basename(fileName).trim();
  return trimmed.replace(/[^a-zA-Z0-9._-]+/g, "_") || "document";
}

function getPrinterLocation(printerName: string) {
  return `${printerName} campus printer`;
}

function getInitialEta() {
  return "15 min";
}

function calculatePriceUnits(
  pages: number,
  copies: number,
  colorMode: "Black and white" | "Color",
  duplex: boolean,
) {
  const perPageUnits =
    colorMode === "Color" ? (duplex ? 6 : 4) : duplex ? 4 : 3;

  return pages * copies * perPageUnits;
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
  request: PrintRequestRow,
  minutesSinceSubmit: number,
): PrintRequestRow {
  if (request.status === "Collected" || request.status === "Cancelled") {
    return request;
  }

  const simulatedProgress = Math.min(100, 12 + minutesSinceSubmit * 18);
  const status = deriveStatus(simulatedProgress);
  const eta =
    status === "Ready"
      ? "Now"
      : status === "Printing"
        ? `${Math.max(1, 12 - minutesSinceSubmit)} min`
        : getInitialEta();

  return {
    ...request,
    status,
    progress: simulatedProgress,
    eta,
    updated_at: new Date().toISOString(),
  };
}

function withLiveStatus(request: PrintRequestRow): PrintRequest {
  const minutesSinceSubmit =
    (Date.now() - new Date(request.submitted_at).getTime()) / 60000;
  const liveRequest = applyStatusProgress(request, minutesSinceSubmit);

  return {
    id: liveRequest.id,
    userId: liveRequest.user_id,
    ownerName: liveRequest.owner_name,
    document: liveRequest.document,
    storedFileName: liveRequest.stored_file_name,
    storedFilePath: liveRequest.stored_file_path,
    printer: liveRequest.printer,
    pages: liveRequest.pages,
    copies: liveRequest.copies,
    colorMode: liveRequest.color_mode,
    duplex: Boolean(liveRequest.duplex),
    estimate: liveRequest.estimate,
    printerLocation: liveRequest.printer_location,
    status: liveRequest.status,
    progress: liveRequest.progress,
    eta: liveRequest.eta,
    submittedAt: liveRequest.submitted_at,
    updatedAt: liveRequest.updated_at,
  };
}

async function getDatabase(): Promise<DatabaseClient> {
  databasePromise ??= open({
    filename: DB_FILE,
    driver: sqlite3.Database,
  });

  const database = await databasePromise;

  await database.exec(`
    CREATE TABLE IF NOT EXISTS print_printers (
      printer_code TEXT PRIMARY KEY,
      remaining_pages INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_balances (
      user_id TEXT PRIMARY KEY,
      balance_units INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS print_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      document TEXT NOT NULL,
      stored_file_name TEXT NOT NULL,
      stored_file_path TEXT NOT NULL,
      printer TEXT NOT NULL,
      pages INTEGER NOT NULL,
      copies INTEGER NOT NULL,
      color_mode TEXT NOT NULL,
      duplex INTEGER NOT NULL,
      estimate REAL NOT NULL,
      printer_location TEXT NOT NULL,
      status TEXT NOT NULL,
      progress INTEGER NOT NULL,
      eta TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  for (const printerCode of printPrinters) {
    await database.run(
      `
        INSERT OR IGNORE INTO print_printers (
          printer_code,
          remaining_pages,
          updated_at
        ) VALUES (?, ?, ?)
      `,
      printerCode,
      randomBetween(600, 1400),
      new Date().toISOString(),
    );
  }

  return database;
}

async function ensureBalanceRow(database: DatabaseClient, userId: string) {
  await database.run(
    `
      INSERT OR IGNORE INTO user_balances (
        user_id,
        balance_units,
        updated_at
      ) VALUES (?, ?, ?)
    `,
    userId,
    INITIAL_BALANCE_UNITS,
    new Date().toISOString(),
  );
}

async function readBalanceRow(
  database: DatabaseClient,
  userId: string,
): Promise<BalanceRow | undefined> {
  return database.get<BalanceRow>(
    `
      SELECT user_id, balance_units, updated_at
      FROM user_balances
      WHERE user_id = ?
    `,
    userId,
  );
}

async function readPrinterRow(
  database: DatabaseClient,
  printerCode: string,
): Promise<PrinterRow | undefined> {
  return database.get<PrinterRow>(
    `
      SELECT printer_code, remaining_pages, updated_at
      FROM print_printers
      WHERE printer_code = ?
    `,
    printerCode,
  );
}

async function readAllPrintRequests(): Promise<PrintRequestRow[]> {
  const database = await getDatabase();
  const rows = await database.all<PrintRequestRow[]>(
    `
      SELECT
        id,
        user_id,
        owner_name,
        document,
        stored_file_name,
        stored_file_path,
        printer,
        pages,
        copies,
        color_mode,
        duplex,
        estimate,
        printer_location,
        status,
        progress,
        eta,
        submitted_at,
        updated_at
      FROM print_requests
    `,
  );

  return rows;
}

function fromUnits(balanceUnits: number) {
  return balanceUnits / 2;
}

export async function listPrinters(): Promise<PrinterQueueItem[]> {
  const database = await getDatabase();
  const rows = await database.all<PrinterRow[]>(
    `
      SELECT printer_code, remaining_pages, updated_at
      FROM print_printers
      ORDER BY printer_code
    `,
  );

  return rows.map((row) => ({
    code: row.printer_code,
    remainingPages: row.remaining_pages,
    updatedAt: row.updated_at,
  }));
}

export async function getUserBalance(userId: string) {
  const database = await getDatabase();
  await ensureBalanceRow(database, userId);
  const row = await readBalanceRow(database, userId);

  return {
    balanceUnits: row?.balance_units ?? INITIAL_BALANCE_UNITS,
    balance: fromUnits(row?.balance_units ?? INITIAL_BALANCE_UNITS),
    updatedAt: row?.updated_at ?? new Date().toISOString(),
  };
}

export async function addUserBalance(userId: string, amountUnits: number) {
  const database = await getDatabase();
  await ensureBalanceRow(database, userId);
  const currentBalance = await readBalanceRow(database, userId);

  if (!currentBalance) {
    throw new Error("Unable to load user balance.");
  }

  const updatedBalance = currentBalance.balance_units + amountUnits;
  const now = new Date().toISOString();

  await database.run(
    `
      UPDATE user_balances
      SET balance_units = ?, updated_at = ?
      WHERE user_id = ?
    `,
    updatedBalance,
    now,
    userId,
  );

  return {
    balanceUnits: updatedBalance,
    balance: fromUnits(updatedBalance),
    updatedAt: now,
  };
}

export async function listPrintRequestsByUser(
  userId: string,
): Promise<PrintRequest[]> {
  const requests = await readAllPrintRequests();

  return requests
    .filter((request) => request.user_id === userId)
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
  const requests = await readAllPrintRequests();
  const request = requests.find(
    (item) => item.id === id && item.user_id === userId,
  );

  return request ? withLiveStatus(request) : null;
}

export async function createPrintRequest(
  input: CreatePrintRequestInput,
  userId: string,
  ownerName: string,
): Promise<PrintRequest> {
  if (!isPrintPrinterCode(input.printer)) {
    throw new Error("Unknown printer selection.");
  }

  const pageBuffer = await input.documentFile.arrayBuffer();
  const pdf = await PDFDocument.load(pageBuffer);
  const pages = pdf.getPageCount();

  if (!pages) {
    throw new Error("The uploaded PDF has no pages.");
  }

  const priceUnits = calculatePriceUnits(
    pages,
    input.copies,
    input.colorMode,
    input.duplex,
  );
  const estimate = fromUnits(priceUnits);
  const database = await getDatabase();
  const printerRow = await readPrinterRow(database, input.printer);

  if (!printerRow) {
    throw new Error("Selected printer is unavailable.");
  }

  await ensureBalanceRow(database, userId);
  const balanceRow = await readBalanceRow(database, userId);

  if (!balanceRow) {
    throw new Error("Unable to load your balance.");
  }

  if (balanceRow.balance_units < priceUnits) {
    throw new Error("Insufficient balance. Please add more balance first.");
  }

  const totalPages = pages * input.copies;
  if (printerRow.remaining_pages < totalPages) {
    throw new Error("The selected printer does not have enough remaining pages.");
  }

  const now = new Date().toISOString();
  const requestId = randomUUID();
  const storedFileName = `${requestId}-${sanitizeFileName(input.documentFile.name)}`;
  const storedFilePath = path.join(UPLOAD_DIR, storedFileName);

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(storedFilePath, Buffer.from(pageBuffer));

  const remainingPrinterPages = printerRow.remaining_pages - totalPages;
  const remainingBalanceUnits = balanceRow.balance_units - priceUnits;

  try {
    await database.exec("BEGIN IMMEDIATE TRANSACTION");

    await database.run(
      `
        UPDATE print_printers
        SET remaining_pages = ?, updated_at = ?
        WHERE printer_code = ?
      `,
      remainingPrinterPages,
      now,
      input.printer,
    );

    await database.run(
      `
        UPDATE user_balances
        SET balance_units = ?, updated_at = ?
        WHERE user_id = ?
      `,
      remainingBalanceUnits,
      now,
      userId,
    );

    await database.run(
      `
        INSERT INTO print_requests (
          id,
          user_id,
          owner_name,
          document,
          stored_file_name,
          stored_file_path,
          printer,
          pages,
          copies,
          color_mode,
          duplex,
          estimate,
          printer_location,
          status,
          progress,
          eta,
          submitted_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      requestId,
      userId,
      ownerName,
      input.documentFile.name,
      storedFileName,
      storedFilePath,
      input.printer,
      pages,
      input.copies,
      input.colorMode,
      Number(input.duplex),
      estimate,
      getPrinterLocation(input.printer),
      "Queued",
      12,
      getInitialEta(),
      now,
      now,
    );

    await database.exec("COMMIT");

    return {
      id: requestId,
      userId,
      ownerName,
      document: input.documentFile.name,
      storedFileName,
      storedFilePath,
      printer: input.printer,
      pages,
      copies: input.copies,
      colorMode: input.colorMode,
      duplex: input.duplex,
      estimate,
      printerLocation: getPrinterLocation(input.printer),
      status: "Queued",
      progress: 12,
      eta: getInitialEta(),
      submittedAt: now,
      updatedAt: now,
      printerRemainingPages: remainingPrinterPages,
      balanceUnitsRemaining: remainingBalanceUnits,
    };
  } catch (error) {
    await database.exec("ROLLBACK");
    await fs.unlink(storedFilePath).catch(() => undefined);
    throw error;
  }
}