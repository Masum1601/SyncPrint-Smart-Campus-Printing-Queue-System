import Link from "next/link";
import type { PrintRequest } from "@/lib/print-requests/types";
import {
  formatSubmittedAt,
  statusTone,
} from "@/lib/print-requests/utils";
import { Badge } from "@/components/ui/Badge";

type PrintRequestCardProps = {
  request: PrintRequest;
};

export function PrintRequestCard({ request }: PrintRequestCardProps) {
  return (
    <article className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/30">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-400">
            {request.id}
          </p>
          <h2 className="mt-2 truncate text-xl font-bold text-zinc-950 dark:text-white">
            {request.document}
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            {request.printer} - {request.pages} pages - {request.copies} copies
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Submitted {formatSubmittedAt(request.submittedAt)}
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <Badge tone={statusTone(request.status)}>{request.status}</Badge>
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            ETA: {request.eta}
          </p>
          <Link
            href={`/my-requests/${request.id}`}
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            View status
          </Link>
        </div>
      </div>

      <div className="mt-5 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-2 rounded-full bg-indigo-600 transition-all"
          style={{ width: `${request.progress}%` }}
        />
      </div>
    </article>
  );
}
