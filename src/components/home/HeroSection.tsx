import { dashboardStats } from "@/lib/site-data";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.18),transparent_34%),linear-gradient(180deg,#fff,rgba(244,244,245,0.75))] dark:bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_34%),linear-gradient(180deg,#09090b,#18181b)]">
      <div className="mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <Badge>Smart Campus Printing</Badge>
          <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-6xl lg:text-7xl">
            Print faster with live queues, smarter routing, and campus-wide
            visibility.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            SyncPrint helps students submit documents, pick the best printer,
            track real-time wait times, and collect finished jobs without
            standing in a line.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/print">Submit a print job</ButtonLink>
            <ButtonLink href="/queue" variant="secondary">
              View live queues
            </ButtonLink>
          </div>
          <dl className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5"
              >
                <dt className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                  {stat.label}
                </dt>
                <dd className="mt-2 text-3xl font-black text-zinc-950 dark:text-white">
                  {stat.value}
                </dd>
                <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {stat.detail}
                </p>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-indigo-600/10 blur-3xl" />
          <div className="relative rounded-[2rem] border border-white/70 bg-white p-5 shadow-2xl shadow-indigo-950/10 dark:border-white/10 dark:bg-zinc-900">
            <div className="rounded-[1.5rem] bg-zinc-950 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Best printer match</p>
                  <h2 className="mt-1 text-2xl font-bold">Library Commons</h2>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
                  8 min wait
                </span>
              </div>

              <div className="mt-8 grid gap-3">
                {[
                  ["Upload checked", "100%"],
                  ["Queue position", "3 of 19"],
                  ["Estimated cost", "BDT 84"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"
                  >
                    <span className="text-sm text-zinc-300">{label}</span>
                    <span className="text-sm font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-indigo-50 p-5 dark:bg-indigo-500/10">
                <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                  Smart routing
                </p>
                <p className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">
                  42%
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  less queue time on peak days
                </p>
              </div>
              <div className="rounded-3xl bg-emerald-50 p-5 dark:bg-emerald-500/10">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Ready alerts
                </p>
                <p className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">
                  Instant
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  status updates for every job
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
