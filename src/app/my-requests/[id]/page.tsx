import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { PrintRequestStatusView } from "@/components/print-requests/PrintRequestStatusView";

export const metadata: Metadata = {
  title: "Print Request Status | SyncPrint",
  description: "Track the current status of a submitted print request.",
};

type RequestStatusPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RequestStatusPage({
  params,
}: RequestStatusPageProps) {
  const { id } = await params;

  return (
    <RequireAuth
      title="Sign in to view request status"
      description="Print request status is only available to the student who submitted the job."
    >
      <PrintRequestStatusView requestId={id} />
    </RequireAuth>
  );
}
