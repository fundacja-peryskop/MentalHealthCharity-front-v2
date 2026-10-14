import { Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { ArrowRight } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { useIconColor } from "../../layout/useIconColor";
import type { MessageCta, Persona } from "../content";
import { personaAvatar } from "./personaAvatar";

/** Matches the live chat's incoming bubble: one tight corner as the "tail". */
const BUBBLE_RADIUS = { borderRadius: 18, borderBottomLeftRadius: 6 } as const;
/** Width of the avatar column, so grouped messages stay aligned without one. */
const AVATAR_SIZE = 36;

const LINK_CLASS = "hiw-cta";
const LINK_STYLE = `.${LINK_CLASS}{text-decoration:none;display:inline-flex;border-radius:9999px;}
.${LINK_CLASS}:focus-visible{outline:3px solid #06b7a7;outline-offset:3px;}`;

interface Props {
    persona: Persona;
    name: string;
    role: string;
    text: string;
    /** Resolved CTA (href already adjusted for the current user). */
    cta?: MessageCta & { label: string };
    /** First message in a run from this person - show their name and role. */
    showHeader: boolean;
    /** Last message in a run - show the avatar (earlier ones keep its space). */
    showAvatar: boolean;
}

/**
 * One incoming message in the demo conversation, styled after the live chat's
 * bubbles. Consecutive messages from the same person are grouped: the name sits
 * on the first, the avatar on the last. A message may end with a CTA button.
 */
export function MessageBubble({ persona, name, role, text, cta, showHeader, showAvatar }: Props) {
    const icon = useIconColor();
    const primaryCta = cta?.variant === "primary";

    return (
        <XStack gap="$sm" alignItems="flex-end" className="chat-msg-in-left">
            {showAvatar ? personaAvatar(persona, name, AVATAR_SIZE) : <Stack width={AVATAR_SIZE} flexShrink={0} />}

            <YStack gap={4} alignItems="flex-start" maxWidth="82%" minWidth={0}>
                {showHeader ? (
                    <XStack alignItems="baseline" gap="$xs" paddingHorizontal="$xs">
                        <Typography variant="smallSemibold" color={persona.tone.ink}>
                            {name}
                        </Typography>
                        <Typography variant="tinyRegular" color="$colorMuted">
                            {role}
                        </Typography>
                    </XStack>
                ) : null}

                <YStack
                    gap="$md"
                    paddingHorizontal="$lg"
                    paddingVertical="$md"
                    backgroundColor="$backgroundStrong"
                    style={BUBBLE_RADIUS}
                >
                    <Typography variant="regularRegular" width="100%">
                        {text}
                    </Typography>

                    {cta ? (
                        <>
                            <style>{LINK_STYLE}</style>
                            <RouterLink to={cta.href} className={LINK_CLASS}>
                                <XStack
                                    alignItems="center"
                                    gap="$sm"
                                    paddingHorizontal="$lg"
                                    minHeight={44}
                                    borderRadius="$full"
                                    borderWidth={primaryCta ? 0 : 1.5}
                                    borderColor="$primary"
                                    backgroundColor={primaryCta ? "$primary" : "$background"}
                                    hoverStyle={{ backgroundColor: primaryCta ? "$primaryHover" : "$primarySoft" }}
                                    pressStyle={{ backgroundColor: primaryCta ? "$primaryPress" : "$primarySoft" }}
                                >
                                    <Typography
                                        variant="regularSemibold"
                                        tag="span"
                                        color={primaryCta ? "$primaryText" : "$primaryTextSoft"}
                                    >
                                        {cta.label}
                                    </Typography>
                                    <ArrowRight size={18} color={primaryCta ? icon.inverse : icon.primary} />
                                </XStack>
                            </RouterLink>
                        </>
                    ) : null}
                </YStack>
            </YStack>
        </XStack>
    );
}
