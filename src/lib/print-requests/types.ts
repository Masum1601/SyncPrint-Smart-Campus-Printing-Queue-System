export type PrintRequestStatus =
  | "Queued"
  | "Printing"
  | "Ready"
  | "Collected"
  | "Cancelled";

export type CreatePrintRequestInput = {
  document: string;
  printer: string;
  pages: number;
  copies: number;
  paperSize: string;
  colorMode: string;
  duplex: boolean;
  priority: string;
  notes: string;
  estimate: number;
};

export type PrintRequest = CreatePrintRequestInput & {
  id: string;
  userId: string;
  ownerName: string;
  printerLocation: string;
  status: PrintRequestStatus;
  progress: number;
  eta: string;
  submittedAt: string;
  updatedAt: string;
};
