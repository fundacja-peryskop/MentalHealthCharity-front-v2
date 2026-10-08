import { Section, Typography } from "@fundacja-peryskop/ui";
import { useTranslation } from "react-i18next";
import { hero } from "../content";
import { PageContainer } from "../../layout/PageContainer";
import { RotatingWord } from "./RotatingWord";

/**
 * §4.3 - hero. Centered display heading (the page's single `<h1>`) with a
 * narrower, muted subheading. The heading's final word rotates through a few
 * warm synonyms for an inviting, "living" accent; the rotation is decorative,
 * so the `<h1>` keeps a stable accessible name (`aria-label`). No illustration
 * lives here; the artwork sits in the pitch cards directly below.
 */
export function Hero() {
    const { t } = useTranslation();
    const words = t(hero.titleWordsKey, { returnObjects: true }) as string[];

    return (
        <Section paddingTop="$xxxl" paddingBottom="$xl" alignItems="center">
            <PageContainer alignItems="center" gap="$lg">
                <Typography
                    variant="title1"
                    tag="h1"
                    align="center"
                    maxWidth={820}
                    aria-label={t(hero.titleKey)}
                    // 48px on desktop (the DS `title1` size), scaling down on narrow
                    // viewports. Inline clamp is used because the DS `$sm`/`$md` media
                    // props resolve unreliably here (see CLAUDE.md).
                    style={{ fontSize: "clamp(34px, 5vw, 48px)", lineHeight: "1.15" }}
                >
                    {/* The last word rotates; brand teal (primary.base) is the heading's one accent. */}
                    {t(hero.titleLeadKey)} <RotatingWord words={words} color="#06b7a7" />
                </Typography>
                <Typography variant="largeRegular" muted align="center" maxWidth={620}>
                    {t(hero.subtitleKey)}
                </Typography>
            </PageContainer>
        </Section>
    );
}
