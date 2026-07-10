import type { Metadata } from "next";
import { QueueList } from "@/components/queue/QueueList";

export const metadata: Metadata = {
  title: "Queue Status | SyncPrint",
  description: "View the current print queue and mark collected jobs as completed.",
};

export default function QueuePage() {
  return <QueueList />;
}