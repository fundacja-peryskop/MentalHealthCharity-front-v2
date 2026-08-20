import { YStack } from "@fundacja-peryskop/ui";
import { AnnouncementBar } from "./components/AnnouncementBar";
import { ArticlesSection } from "./components/ArticlesSection";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { PitchCards } from "./components/PitchCards";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { TopicsGrid } from "./components/TopicsGrid";

/**
 * Marketing homepage, rebuilt on the Peryskop design system (spec §6).
 *
 * This is a thin orchestration layer: it renders the sections in order and owns
 * no markup or business logic itself — each section is its own component and
 * pulls its own content/data. On the homepage the app's global chrome
 * (CrisisBar / Navbar / Footer) is suppressed so this page owns the full
 * announcement-bar → header → … → footer composition.
 */
export function HomePage() {
    return (
        <YStack width="100%" backgroundColor="$background">
            <AnnouncementBar />
            <SiteHeader />
            <Hero />
            <PitchCards />
            <TopicsGrid />
            <HowItWorks />
            <ArticlesSection />
            <SiteFooter />
        </YStack>
    );
}
