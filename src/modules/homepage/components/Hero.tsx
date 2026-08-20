import { Section, Typography } from "@fundacja-peryskop/ui";
import { hero } from "../content";
import { PageContainer } from "./PageContainer";

/**
 * §4.3 — hero. Centered display heading (the page's single `<h1>`) with a
 * narrower, muted subheading. No illustration lives here; the artwork sits in
 * the pitch cards directly below.
 */
export function Hero() {
    return (
        <Section paddingTop="$xxxl" paddingBottom="$xl" alignItems="center">
            <PageContainer alignItems="center" gap="$lg">
                <Typography
                    variant="title1"
                    tag="h1"
                    align="center"
                    maxWidth={820}
                    $sm={{ fontSize: 34, lineHeight: 40 }}
                >
                    {hero.title}
                </Typography>
                <Typography variant="largeRegular" muted align="center" maxWidth={620}>
                    {hero.subtitle}
                </Typography>
            </PageContainer>
        </Section>
    );
}
