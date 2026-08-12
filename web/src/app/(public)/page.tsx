import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ActivitiesSection from "@/components/sections/ActivitiesSection";
import TrainingSection from "@/components/sections/TrainingSection";
import EventsSection from "@/components/sections/EventsSection";
import {
  getPublicOnlineFormations,
  getPublicPresentialFormations,
} from "@/lib/db";

export default async function Home() {
  const [onlineFormations, presentielFormations] = await Promise.all([
    getPublicOnlineFormations(),
    getPublicPresentialFormations(),
  ]);

  const serializedOnline = JSON.parse(JSON.stringify(onlineFormations));
  const serializedPresential = JSON.parse(JSON.stringify(presentielFormations));

  return (
    <main className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <ActivitiesSection />
      <TrainingSection />
      <EventsSection
        presentielFormations={serializedPresential}
        onlineFormations={serializedOnline}
      />
    </main>
  );
}
