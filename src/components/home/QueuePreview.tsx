import { queueJobs } from "@/lib/site-data";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function QueuePreview() {
  return (
    <section className="bg-zinc-50 py-24 dark:bg-zinc-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Live Queue"
          title="Know exactly where every job stands"
          description="A transparent queue experience helps students plan pickup times and keeps the print desk from becoming a guessing game."
        />
        <div className="mt-14 overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-xl shadow-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="grid border-b border-zinc-200 bg-zinc-50 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 md:grid-cols-[1fr_0.8fr_0.7fr_0.5fr]">
            <span>Document</span>
            <span className="hidden md:block">Printer</span>
            <span className="hidden md:block">Status</span>
            <span className="hidden md:block text-right">ETA</span>
          </div>
          {queueJobs.map((job) => (
            <article
              key={job.id}
              className="grid gap-4 border-b border-zinc-100 px-6 py-5 last:border-0 dark:border-zinc-800 md:grid-cols-[1fr_0.8fr_0.7fr_0.5fr] md:items-center"
            >
              <div>
                <p className="font-bold text-zinc-950 dark:text-white">
                  {job.document}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {job.id} - {job.pages} pages - {job.owner}
                </p>
              </div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {job.printer}
              </p>
              <div>
                <Badge
                  tone={
                    job.status === "Ready"
                      ? "emerald"
                      : job.status === "Printing"
                        ? "indigo"
                        : "amber"
                  }
                >
                  {job.status}
                </Badge>
                <div className="mt-3 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-2 rounded-full bg-indigo-600"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>
              <p className="font-bold text-zinc-950 dark:text-white md:text-right">
                {job.eta}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
