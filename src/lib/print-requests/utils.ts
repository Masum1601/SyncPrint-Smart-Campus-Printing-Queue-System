import type { PrintRequestStatus } from "@/lib/print-requests/types";

export function statusTone(
  status: PrintRequestStatus,
): "indigo" | "emerald" | "amber" | "zinc" {
  switch (status) {
    case "Ready":
    case "Collected":
      return "emerald";
    case "Printing":
      return "indigo";
    case "Cancelled":
      return "zinc";
    default:
      return "amber";
  }
}

export function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export const statusSteps: PrintRequestStatus[] = [
  "Queued",
  "Printing",
  "Ready",
  "Collected",
];

export function getStatusStepIndex(status: PrintRequestStatus) {
  if (status === "Cancelled") {
    return -1;
  }

  return statusSteps.indexOf(status);
}
