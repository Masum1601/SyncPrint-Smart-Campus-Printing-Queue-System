import { SectionHeading } from "@/components/ui/SectionHeading";

const features = [
  {
    title: "Real-time queue visibility",
    description:
      "Students see printer availability, queue length, and estimated pickup time before submitting.",
  },
  {
    title: "Smart printer recommendations",
    description:
      "The interface highlights the best location based on printer status, job type, and expected wait.",
  },
  {
    title: "Job preferences",
    description:
      "Choose copies, color mode, duplex printing, priority level, page range, and pickup location.",
  },
  {
    title: "Operational monitoring",
    description:
      "Admins can quickly spot low supplies, overloaded printers, maintenance states, and campus demand.",
  },
  {
    title: "Pickup-ready updates",
    description:
      "Students can follow job progress from queued to printing to ready, reducing desk interruptions.",
  },
  {
    title: "Mobile-first design",
    description:
      "Every screen works cleanly on phones, tablets, and lab desktops for high-traffic campus use.",
  },
];

export function FeatureGrid() {
  return (
    <section className="bg-white py-24 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Platform Features"
          title="Everything a campus print flow needs"
          description="SyncPrint keeps students informed and gives staff a clear operational overview without making the print process feel complicated."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="group rounded-[2rem] border border-zinc-200 bg-zinc-50 p-6 transition hover:-translate-y-1 hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:shadow-indigo-950/5 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-indigo-500/30 dark:hover:bg-zinc-900"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-black text-white shadow-lg shadow-indigo-600/20">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-6 text-lg font-bold text-zinc-950 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
