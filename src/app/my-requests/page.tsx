import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { MyPrintRequests } from "@/components/print-requests/MyPrintRequests";

export const metadata: Metadata = {
  title: "My Print Requests | SyncPrint",
  description: "View all submitted campus print requests.",
};

export default function MyRequestsPage() {
  return (
    <RequireAuth
      title="Sign in to view your requests"
      description="Your submitted print jobs are linked to your student account so you can track them securely."
    >
      <MyPrintRequests />
    </RequireAuth>
  );
}
