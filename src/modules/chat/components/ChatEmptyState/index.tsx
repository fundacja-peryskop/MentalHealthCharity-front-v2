import { Avatar, Stack, Typography, YStack } from "@fundacja-peryskop/ui";
import { MessageCircleHeart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { User } from "../../../auth/types";
import resolveAssetUrl from "../../../shared/helpers/resolveAssetUrl";

interface Props {
    /** Whether the current user can actually send a message in this chat. */
    canSend: boolean;
    /**
     * Whether the user holds a privileged role (volunteer / admin / redactor /
     * supervisor). Drives a work-context message instead of the plain one.
     */
    isPrivileged: boolean;
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
 *  - a participant who can write gets a gentle "start the conversation" nudge
 *    (privileged roles get a work-context variant);
 *  - someone who cannot write (e.g. a read-only observer) just sees that the
 *    conversation is empty, with no misleading call to action.
 */
const ChatEmptyState = ({ canSend, isPrivileged, participants = [] }: Props) => {
    const { t } = useTranslation();

    const title = canSend ? t("chat.empty_title") : t("chat.empty_readonly_title");

    const description = !canSend
        ? t("chat.empty_readonly_description")
        : isPrivileged
          ? t("chat.empty_privileged_description")
          : t("chat.empty_user_description");

    return (
        <YStack flex={1} alignItems="center" justifyContent="center" paddingHorizontal="$xl" gap="$lg">
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
                    <MessageCircleHeart size={40} color="#035c54" strokeWidth={1.75} aria-hidden />
                </Stack>
            )}

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
