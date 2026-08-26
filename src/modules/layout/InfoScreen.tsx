import { Section, Typography, YStack } from "@fundacja-peryskop/ui";
import type { ReactNode } from "react";
import { PageContainer } from "./PageContainer";

interface Props {
    /** Leading illustration or icon element. */
    icon?: ReactNode;
    title: string;
    description?: string;
    /** Extra actions or a footer rendered below the copy. */
    children?: ReactNode;
    maxWidth?: number;
}

/**
 * Centered informational screen (icon + title + description + optional actions).
 * Shared by the simple status/notice views (email sent, confirmation, errors).
 */
export function InfoScreen({ icon, title, description, children, maxWidth = 560 }: Props) {
    return (
        <Section alignItems="center" justifyContent="center" minHeight="70vh" paddingVertical="$xxxl">
            <PageContainer alignItems="center" gap="$xl">
                {icon}
                <YStack gap="$sm" maxWidth={maxWidth} alignItems="center">
                    <Typography variant="title2" tag="h1" align="center">
                        {title}
                    </Typography>
                    {description ? (
                        <Typography variant="largeRegular" muted align="center">
                            {description}
                        </Typography>
                    ) : null}
                </YStack>
                {children}
            </PageContainer>
        </Section>
    );
}
