import { Avatar, Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { Clock, Hand, MessageCircleHeart, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { User } from "../../../auth/types";
import { useIconColor } from "../../../layout/useIconColor";
import resolveAssetUrl from "../../../shared/helpers/resolveAssetUrl";

/** Short "how this chat works" tips for someone about to write to their volunteer. */
const MENTEE_TIPS = [
    { key: "start", icon: Hand },
    { key: "pace", icon: Clock },
    { key: "return", icon: RotateCcw },
] as const;

interface Props {
    /** Whether the current user can actually send a message in this chat. */
    canSend: boolean;
    /**
     * Whether the user holds a privileged role (volunteer / admin / redactor /
     * supervisor). Drives a work-context message instead of the plain one.
     */
    isPrivileged: boolean;
    /** A one-to-one support chat (a person in crisis with their volunteer). */
    isSupportChat?: boolean;
    /** People in the conversation - shown as a stacked avatar group. */
    participants?: User[];
}

/**
 * Friendly empty state for a conversation with no messages yet.
 *
 * It leads with a stacked group of the chat's participants ("here's who's in
 * this conversation"), which is warmer and more personal than a generic icon;
 * it falls back to the icon only when no participants are known.
 *
 * The copy adapts to the user's real capability:
 *  - a person in crisis who has just been matched gets a welcome and three
 *    short tips on how the chat works (they often arrive straight from the
 *    form);
 *  - other participants who can write get a gentle "start the conversation"
 *    nudge (privileged roles get a work-context variant);
 *  - someone who cannot write (e.g. a read-only observer) just sees that the
 *    conversation is empty, with no misleading call to action.
 */
const ChatEmptyState = ({ canSend, isPrivileged, isSupportChat = false, participants = [] }: Props) => {
    const { t } = useTranslation();
    const icon = useIconColor();
    const isMatchedMentee = canSend && !isPrivileged && isSupportChat;

    const title = !canSend
        ? t("chat.empty_readonly_title")
        : isMatchedMentee
          ? t("chat.empty_mentee_title")
          : t("chat.empty_title");

    const description = !canSend
        ? t("chat.empty_readonly_description")
        : isMatchedMentee
          ? t("chat.empty_mentee_description")
          : isPrivileged
            ? t("chat.empty_privileged_description")
            : t("chat.empty_user_description");

    return (
        <YStack flex={1} minHeight={0} style={{ overflowY: "auto" }}>
            <YStack
                alignItems="center"
                paddingHorizontal="$xl"
                paddingVertical="$xl"
                gap="$lg"
                width="100%"
                style={{ margin: "auto" }}
            >
                {participants.length > 0 ? (
                    <Avatar.Group max={5} size={56}>
                        {participants.map((person) => (
                            <Avatar
                                key={person.id}
                                name={person.full_name}
                                src={person.chat_avatar_url ? resolveAssetUrl(person.chat_avatar_url) : undefined}
                            />
                        ))}
                    </Avatar.Group>
                ) : (
                    <Stack
                        width={88}
                        height={88}
                        borderRadius="$full"
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor="$primarySoft"
                    >
                        <MessageCircleHeart size={40} color={icon.primary} strokeWidth={1.75} aria-hidden />
                    </Stack>
                )}

                <YStack gap="$sm" maxWidth={440} alignItems="center">
                    <Typography variant="title3" style={{ display: "block", width: "100%", textAlign: "center" }}>
                        {title}
                    </Typography>
                    <Typography
                        variant="largeRegular"
                        muted
                        style={{ display: "block", width: "100%", textAlign: "center", lineHeight: "1.6" }}
                    >
                        {description}
                    </Typography>
                </YStack>

                {isMatchedMentee ? (
                    <YStack
                        tag="ul"
                        aria-label={t("chat.empty_mentee_tips.label")}
                        width="100%"
                        maxWidth={440}
                        gap="$sm"
                        margin={0}
                        padding="$lg"
                        borderRadius="$md"
                        backgroundColor="$backgroundHover"
                        style={{ listStyle: "none" }}
                    >
                        {MENTEE_TIPS.map(({ key, icon: TipIcon }) => (
                            <XStack key={key} tag="li" gap="$md" alignItems="flex-start">
                                <Stack
                                    width={32}
                                    height={32}
                                    flexShrink={0}
                                    borderRadius="$full"
                                    alignItems="center"
                                    justifyContent="center"
                                    backgroundColor="$primarySoft"
                                    aria-hidden
                                >
                                    <TipIcon size={16} color={icon.primary} />
                                </Stack>
                                <Typography variant="regularRegular" flex={1} paddingTop={5} width="100%">
                                    {t(`chat.empty_mentee_tips.${key}`)}
                                </Typography>
                            </XStack>
                        ))}
                    </YStack>
                ) : null}
            </YStack>
        </YStack>
    );
};

export default ChatEmptyState;
