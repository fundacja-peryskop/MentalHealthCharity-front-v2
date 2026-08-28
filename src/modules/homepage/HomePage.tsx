import { YStack } from "@fundacja-peryskop/ui";
import { ArticlesSection } from "./components/ArticlesSection";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { PitchCards } from "./components/PitchCards";
import { TopicsGrid } from "./components/TopicsGrid";

/**
 * Marketing homepage body, rebuilt on the Peryskop design system.
 *
 * Thin orchestration: renders the body sections in order. The page chrome
 * (announcement bar, header, footer) is provided globally by the app `Layout`.
 */
export function HomePage() {
    return (
        <YStack width="100%" backgroundColor="$background">
            <Hero />
            <PitchCards />
            <TopicsGrid />
            <HowItWorks />
            <ArticlesSection />
        </YStack>
    );
}
