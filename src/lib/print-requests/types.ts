export type PrintRequestStatus =
  | "Queued"
  | "Printing"
  | "Ready"
  | "Collected"
  | "Cancelled";

export type CreatePrintRequestInput = {
  documentFile: File;
  printer: string;
  copies: number;
  colorMode: "Black and white" | "Color";
  duplex: boolean;
};

export type PrintRequest = {
  id: string;
  userId: string;
  ownerName: string;
  document: string;
  storedFileName: string;
  storedFilePath: string;
  pages: number;
  paperSize: string;
  priority: string;
  notes?: string;
  estimate: number;
  printerLocation: string;
  status: PrintRequestStatus;
  progress: number;
  eta: string;
  submittedAt: string;
  updatedAt: string;
  printer: string;
  copies: number;
  colorMode: "Black and white" | "Color";
  duplex: boolean;
  printerRemainingPages?: number;
  balanceUnitsRemaining?: number;
};

export type PrinterQueueItem = {
  code: string;
  remainingPages: number;
  updatedAt: string;
};
