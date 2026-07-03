import { ScrollMarquee } from './components/ScrollMarquee';
import { Footer } from './components/Footer';
import HeroSection from './components/HeroSection';
import { JourneyTimeline } from './components/JourneyTimeline';
import { SkillsConstellation } from './components/SkillsConstellation';
import { PremiumBentoGrid } from './components/PremiumBentoGrid';

export default function About() {
  return (
    <div className="bg-background text-foreground selection:bg-foreground selection:text-background min-h-screen w-full">
      {/* HERO */}
      <HeroSection />

      {/* MARQUEE */}
      <section className="border-border/20 bg-background w-full overflow-hidden border-y py-12 md:py-20">
        <ScrollMarquee
          text="KIRITO"
          direction={-1}
          textClassName="text-[6rem] sm:text-[8rem] md:text-[10rem] lg:text-[15rem]"
        />
      </section>

      {/* ABOUT */}
      <PremiumBentoGrid />

      <JourneyTimeline />

      <SkillsConstellation />

      <Footer />
    </div>
  );
}
