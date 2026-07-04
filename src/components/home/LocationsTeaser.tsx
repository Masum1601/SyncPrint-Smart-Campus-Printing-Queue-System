import { campusPrinters } from "@/lib/site-data";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function LocationsTeaser() {
  return (
    <section className="bg-white py-24 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Printer Network"
              title="Find the right printer before you walk"
              description="Browse campus print points by location, available features, supply levels, and wait time."
            />
            <div className="mt-8">
              <ButtonLink href="/locations" variant="secondary">
                Explore all locations
              </ButtonLink>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {campusPrinters.slice(0, 4).map((printer) => (
              <article
                key={printer.name}
                className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-zinc-950 dark:text-white">
                      {printer.name}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {printer.location}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      printer.status === "Available"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : printer.status === "Busy"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                          : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {printer.status}
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-4 dark:bg-zinc-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                      Queue
                    </p>
                    <p className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">
                      {printer.queue}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 dark:bg-zinc-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                      Wait
                    </p>
                    <p className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">
                      {printer.wait}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
