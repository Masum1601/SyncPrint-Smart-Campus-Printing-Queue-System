import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  {
    title: "Upload your document",
    description:
      "Add file details, select print preferences, and see estimated cost before submission.",
  },
  {
    title: "Pick the best printer",
    description:
      "Compare live wait times, printer features, campus locations, and supply readiness.",
  },
  {
    title: "Track and collect",
    description:
      "Follow job progress in the queue and collect when the status changes to ready.",
  },
];

export function WorkflowSection() {
  return (
    <section className="bg-zinc-950 py-24 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Simple Workflow"
          title="From upload to pickup in three steps"
          description="The experience is designed around the real student journey, not around printer settings."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sm font-black text-zinc-950">
                {index + 1}
              </span>
              <h3 className="mt-8 text-xl font-bold">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
