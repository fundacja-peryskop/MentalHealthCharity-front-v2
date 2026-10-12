import { Stack, Typography, YStack } from "@fundacja-peryskop/ui";
import { MessageCircleHeart } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
    /** Whether the current user can actually send a message in this chat. */
    canSend: boolean;
    /**
     * Whether the user holds a privileged role (volunteer / admin / redactor /
     * supervisor). Drives a work-context message instead of the plain one.
     */
    isPrivileged: boolean;
}

/**
 * Friendly empty state for a conversation with no messages yet.
 *
 * The copy adapts to the user's real capability:
 *  - a participant who can write gets a gentle "start the conversation" nudge
 *    (privileged roles get a work-context variant);
 *  - someone who cannot write (e.g. a read-only observer) just sees that the
 *    conversation is empty, with no misleading call to action.
 *
 * It never renders role-specific action buttons here - the only honest next
 * step is the message input directly below it, so we point at that.
 */
const ChatEmptyState = ({ canSend, isPrivileged }: Props) => {
    const { t } = useTranslation();

    const title = canSend ? t("chat.empty_title") : t("chat.empty_readonly_title");

    const description = !canSend
        ? t("chat.empty_readonly_description")
        : isPrivileged
          ? t("chat.empty_privileged_description")
          : t("chat.empty_user_description");

    return (
        <YStack flex={1} alignItems="center" justifyContent="center" paddingHorizontal="$xl" gap="$lg">
            <Stack
                width={88}
                height={88}
                borderRadius="$full"
                alignItems="center"
                justifyContent="center"
                backgroundColor="$primarySoft"
            >
                <MessageCircleHeart size={40} color="#035c54" strokeWidth={1.75} aria-hidden />
            </Stack>

            <YStack gap="$sm" maxWidth={420} alignItems="center">
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
        </YStack>
    );
};

export default ChatEmptyState;
