import { Avatar, Chip, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { User } from "../../../auth/types";
import resolveAssetUrl from "../../../shared/helpers/resolveAssetUrl";
import { translatedRoles } from "../../../users/constants";

/** Matches the 36px rows of the participants list. */
const AVATAR_SIZE = 36;

interface Props {
    participant: User;
    /**
     * Show the email under the name and move the role into a chip next to it.
     * Only for viewers allowed to see contact details (`VIEW_PARTICIPANT_DETAILS`).
     */
    showEmail?: boolean;
}

/**
 * Avatar, name and one secondary line for a row of the chat participants list.
 * The secondary line is the role, or - for staff - the email, with the role
 * moved into a chip beside the name. Long names and emails are truncated; the
 * full values are in the participant popover.
 */
const ParticipantSummary = ({ participant, showEmail = false }: Props) => {
    const role = translatedRoles[participant.user_role];
    const withEmail = showEmail && Boolean(participant.email);

    return (
        <XStack alignItems="center" gap="$md" flex={1} minWidth={0}>
            <Avatar
                size={AVATAR_SIZE}
                src={resolveAssetUrl(participant.chat_avatar_url)}
                name={participant.full_name}
            />
            <YStack flex={1} minWidth={0} gap={2}>
                <XStack alignItems="center" gap="$sm" minWidth={0}>
                    <Typography variant="regularSemibold" numberOfLines={1} flexShrink={1} minWidth={0}>
                        {participant.full_name}
                    </Typography>
                    {withEmail ? (
                        <Chip size="sm" color="primary" flexShrink={0}>
                            {role}
                        </Chip>
                    ) : null}
                </XStack>
                <Typography variant="tinySemibold" color="$colorMuted" numberOfLines={1}>
                    {withEmail ? participant.email : role}
                </Typography>
            </YStack>
        </XStack>
    );
};

export default ParticipantSummary;
