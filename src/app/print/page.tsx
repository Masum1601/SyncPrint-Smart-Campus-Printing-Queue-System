import type { Metadata } from "next";
import { PrintJobForm } from "@/components/print/PrintJobForm";

export const metadata: Metadata = {
  title: "Submit Print Job | SyncPrint",
  description: "Upload a document and configure a campus print job.",
};

export default function PrintPage() {
  return <PrintJobForm />;
}
