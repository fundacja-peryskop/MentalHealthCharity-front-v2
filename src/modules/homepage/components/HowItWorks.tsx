import { Section, Typography } from "@fundacja-peryskop/ui";
import { howItWorksHeading, howItWorksSteps } from "../content";
import { Carousel } from "./Carousel";
import { PageContainer } from "../../layout/PageContainer";
import { StepCard } from "./StepCard";

/**
 * §4.6 — "Jak działamy?" section. Centered heading over the reusable
 * `Carousel`, which shows roughly two step cards at a time on desktop and one
 * on mobile. The carousel supports any number of steps; the app's real intake
 * flow is three.
 */
export function HowItWorks() {
    return (
        <Section paddingVertical="$xxxl" alignItems="center">
            <PageContainer gap="$xl" alignItems="center">
                <Typography variant="title2" tag="h2" align="center">
                    {howItWorksHeading}
                </Typography>

                <Carousel
                    items={howItWorksSteps}
                    ariaLabel={howItWorksHeading}
                    visibleCount={{ base: 1, md: 2 }}
                    getKey={(step) => step.number}
                    renderItem={(step) => <StepCard step={step} />}
                />
            </PageContainer>
        </Section>
    );
}
