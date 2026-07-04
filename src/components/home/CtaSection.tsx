import { ButtonLink } from "@/components/ui/ButtonLink";

export function CtaSection() {
  return (
    <section className="bg-white py-24 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2.5rem] bg-indigo-600 px-6 py-16 text-center text-white shadow-2xl shadow-indigo-600/20 sm:px-12">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-indigo-100">
            Ready for campus scale
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
            Give students a print experience that feels fast, clear, and modern.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-indigo-100">
            Start with the frontend flow today, then connect submissions,
            payments, notifications, and admin controls as the backend grows.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink
              href="/print"
              variant="secondary"
              className="border-white/30 bg-white text-indigo-700 hover:bg-indigo-50"
            >
              Create print job
            </ButtonLink>
            <ButtonLink
              href="/dashboard"
              variant="ghost"
              className="text-white hover:bg-white/10 hover:text-white"
            >
              Open dashboard
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
