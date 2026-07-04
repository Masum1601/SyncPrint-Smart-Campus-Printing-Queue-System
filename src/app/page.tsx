import { CtaSection } from "@/components/home/CtaSection";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { HeroSection } from "@/components/home/HeroSection";
import { LocationsTeaser } from "@/components/home/LocationsTeaser";
import { QueuePreview } from "@/components/home/QueuePreview";
import { WorkflowSection } from "@/components/home/WorkflowSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeatureGrid />
      <QueuePreview />
      <WorkflowSection />
      <LocationsTeaser />
      <CtaSection />
    </>
  );
}
