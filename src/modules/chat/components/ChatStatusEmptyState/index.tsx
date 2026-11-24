import { Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { Check, History, Mail, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppLink } from "../../../layout/AppLink";
import { CtaButton } from "../../../layout/CtaButton";
import { useIconColor } from "../../../layout/useIconColor";
import type { MyChatStatus } from "../../../matching/types";
import { CONTACT_EMAIL } from "../../../shared/constants";
import { getEmptyStateContent, type EmptyStateContent, type NoticeIcon } from "./content";
import { EmptyStateIllustration, ILLUSTRATION_STYLE } from "./illustrations";

const K = "chat.status_empty";
const NOTICE_ICONS: Record<NoticeIcon, typeof Mail> = { mail: Mail, history: History };
const CENTER = { textAlign: "center" as const };
/** Even line lengths - no lonely last word under a centred heading or paragraph. */
const TITLE_STYLE = { ...CENTER, textWrap: "balance" as const };
const BODY_STYLE = { ...CENTER, lineHeight: "1.6", textWrap: "pretty" as const };

interface Props {
    /** Where the person stands; `undefined` renders the neutral "quiet" state. */
    status?: MyChatStatus;
    /**
     * `full` fills the conversation pane; `compact` is a card that sits above
     * the chat list on phones (when the list holds e.g. only group chats).
     */
    variant?: "full" | "compact";
}

/**
 * Explains, in plain language, why there is no conversation yet and what
 * happens next - for people waiting for a volunteer, volunteers waiting for
 * their first mentee, volunteers who paused, people who could ask for help
 * again, and staff. The status is kept fresh by `useMyChatStatus`, and this is
 * a polite live region so screen readers hear when it changes.
 */
const ChatStatusEmptyState = ({ status, variant = "full" }: Props) => {
    const content = getEmptyStateContent(status);
    return variant === "compact" ? <CompactState content={content} /> : <FullState content={content} />;
};

function FullState({ content }: { content: EmptyStateContent }) {
    const { t } = useTranslation();

    return (
        <YStack flex={1} minHeight={0} style={{ overflowY: "auto" }}>
            <style>{ILLUSTRATION_STYLE}</style>
            <YStack
                className="cse-root"
                role="status"
                aria-live="polite"
                width="100%"
                maxWidth={540}
                alignItems="center"
                gap="$lg"
                paddingHorizontal="$lg"
                paddingVertical="$xxl"
                style={{ margin: "auto" }}
            >
                <div className="cse-in">
                    <EmptyStateIllustration kind={content.illustration} size={200} />
                </div>

                <YStack className="cse-in cse-d1" gap="$sm" width="100%" alignItems="center">
                    <Typography variant="title3" tag="h2" width="100%" style={TITLE_STYLE}>
                        {t(content.titleKey)}
                    </Typography>
                    <Typography variant="largeRegular" tag="p" muted width="100%" style={BODY_STYLE}>
                        {t(content.bodyKey, content.values)}
                    </Typography>
                    {content.metaKey ? (
                        <Typography variant="smallSemibold" color="$primaryTextSoft" style={CENTER}>
                            {t(content.metaKey, content.values)}
                        </Typography>
                    ) : null}
                </YStack>

                {content.showProgress ? <SearchProgress /> : null}
                {content.notice ? <Notice notice={content.notice} /> : null}
                <Actions content={content} />
                {content.showCrisisLine ? <CrisisLine /> : null}

                <XStack className="cse-in cse-d4" flexWrap="wrap" justifyContent="center" columnGap="$xs">
                    <Typography variant="smallRegular" muted>
                        {t(`${K}.contact`)}
                    </Typography>
                    <AppLink href={`mailto:${CONTACT_EMAIL}`} variant="smallSemibold" color="$primary">
                        {CONTACT_EMAIL}
                    </AppLink>
                </XStack>
            </YStack>
        </YStack>
    );
}

function CompactState({ content }: { content: EmptyStateContent }) {
    const { t } = useTranslation();
    const action = content.action ?? content.secondaryAction;

    return (
        <XStack
            className="cse-root"
            role="status"
            aria-live="polite"
            gap="$md"
            alignItems="center"
            marginHorizontal="$lg"
            padding="$md"
            borderRadius="$lg"
            backgroundColor="$backgroundHover"
            borderWidth={1}
            borderColor="$backgroundStrong"
        >
            <style>{ILLUSTRATION_STYLE}</style>
            <EmptyStateIllustration kind={content.illustration} size={64} />
            <YStack flex={1} gap={2} minWidth={0}>
                <Typography variant="regularSemibold" tag="h2" width="100%">
                    {t(content.titleKey)}
                </Typography>
                <Typography variant="smallRegular" muted width="100%">
                    {t(content.bodyKey, content.values)}
                </Typography>
                {action ? (
                    <AppLink href={action.href} variant="smallSemibold" color="$primary" marginTop="$xs">
                        {t(action.labelKey)}
                    </AppLink>
                ) : null}
            </YStack>
        </XStack>
    );
}

/** Three plain steps so nobody has to guess where they are in the process. */
function SearchProgress() {
    const { t } = useTranslation();
    const icon = useIconColor();
    const steps = [
        { key: "sent", state: "done" },
        { key: "searching", state: "current" },
        { key: "conversation", state: "upcoming" },
    ] as const;

    return (
        <XStack
            className="cse-in cse-d2"
            tag="ol"
            aria-label={t(`${K}.progress.label`)}
            width="100%"
            justifyContent="center"
            alignItems="flex-start"
            margin={0}
            padding={0}
            style={{ listStyle: "none" }}
        >
            {steps.map((step, index) => (
                <YStack
                    key={step.key}
                    tag="li"
                    flex={1}
                    alignItems="center"
                    gap="$xs"
                    minWidth={0}
                    aria-current={step.state === "current" ? "step" : undefined}
                >
                    {/* line - circle - line: the connector stays continuous at any width */}
                    <XStack width="100%" alignItems="center" aria-hidden>
                        <ProgressLine visible={index > 0} reached={index > 0 && steps[index - 1].state === "done"} />
                        <Stack
                            width={28}
                            height={28}
                            borderRadius="$full"
                            alignItems="center"
                            justifyContent="center"
                            backgroundColor={
                                step.state === "done"
                                    ? "$primary"
                                    : step.state === "current"
                                      ? "$primarySoft"
                                      : "$backgroundStrong"
                            }
                            aria-hidden
                        >
                            {step.state === "done" ? (
                                <Check size={16} color={icon.inverse} strokeWidth={3} />
                            ) : step.state === "current" ? (
                                <Stack
                                    className="cse-pulse"
                                    width={10}
                                    height={10}
                                    borderRadius="$full"
                                    backgroundColor="$primary"
                                />
                            ) : (
                                <Stack width={8} height={8} borderRadius="$full" backgroundColor="$borderColor" />
                            )}
                        </Stack>
                        <ProgressLine visible={index < steps.length - 1} reached={step.state === "done"} />
                    </XStack>
                    <Typography
                        variant={step.state === "current" ? "smallSemibold" : "smallRegular"}
                        color={step.state === "upcoming" ? "$colorMuted" : "$color"}
                        width="100%"
                        paddingHorizontal="$xs"
                        style={CENTER}
                    >
                        {t(`${K}.progress.${step.key}`)}
                    </Typography>
                </YStack>
            ))}
        </XStack>
    );
}

/** Half of the connector between two steps; invisible at the ends of the tracker. */
function ProgressLine({ visible, reached }: { visible: boolean; reached: boolean }) {
    return (
        <Stack
            flex={1}
            height={2}
            backgroundColor={!visible ? "$backgroundTransparent" : reached ? "$primaryBorder" : "$backgroundStrong"}
        />
    );
}

function Notice({ notice }: { notice: NonNullable<EmptyStateContent["notice"]> }) {
    const { t } = useTranslation();
    const icon = useIconColor();
    const Icon = NOTICE_ICONS[notice.icon];

    return (
        <XStack
            className="cse-in cse-d3"
            width="100%"
            gap="$md"
            alignItems="flex-start"
            padding="$lg"
            borderRadius="$md"
            backgroundColor="$backgroundHover"
            borderWidth={1}
            borderColor="$backgroundStrong"
        >
            <Stack
                width={40}
                height={40}
                flexShrink={0}
                borderRadius="$md"
                alignItems="center"
                justifyContent="center"
                backgroundColor="$primarySoft"
                aria-hidden
            >
                <Icon size={20} color={icon.primary} />
            </Stack>
            <YStack flex={1} gap={2}>
                <Typography variant="regularSemibold" width="100%">
                    {t(notice.titleKey)}
                </Typography>
                <Typography variant="regularRegular" muted width="100%" style={{ lineHeight: "1.5" }}>
                    {t(notice.bodyKey)}
                </Typography>
            </YStack>
        </XStack>
    );
}

function Actions({ content }: { content: EmptyStateContent }) {
    const { t } = useTranslation();
    if (!content.action && !content.secondaryAction) return null;

    return (
        <XStack className="cse-in cse-d3" flexWrap="wrap" justifyContent="center" gap="$md">
            {content.action ? (
                <CtaButton href={content.action.href} variant="primary">
                    {t(content.action.labelKey)}
                </CtaButton>
            ) : null}
            {content.secondaryAction ? (
                <CtaButton href={content.secondaryAction.href} variant="mutedPrimary">
                    {t(content.secondaryAction.labelKey)}
                </CtaButton>
            ) : null}
        </XStack>
    );
}

/** People in crisis must always see where to turn when it cannot wait. */
function CrisisLine() {
    const { t } = useTranslation();
    const icon = useIconColor();

    return (
        <XStack
            className="cse-in cse-d4"
            flexWrap="wrap"
            justifyContent="center"
            alignItems="center"
            columnGap="$sm"
            rowGap="$xs"
            paddingHorizontal="$md"
            paddingVertical="$sm"
            borderRadius="$md"
            backgroundColor="$dangerSoft"
        >
            <Phone size={14} color={icon.danger} aria-hidden />
            <Typography variant="smallRegular" color="$dangerTextSoft">
                {t(`${K}.crisis_line`)}
            </Typography>
            <AppLink href="tel:112" variant="smallBold" color="$dangerTextSoft">
                112
            </AppLink>
            <Typography variant="smallRegular" color="$dangerTextSoft" aria-hidden>
                ·
            </Typography>
            <AppLink href="tel:116123" variant="smallBold" color="$dangerTextSoft">
                {t(`${K}.crisis_helpline`)}
            </AppLink>
        </XStack>
    );
}

export default ChatStatusEmptyState;
