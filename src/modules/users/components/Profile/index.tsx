import { Stack, Typography, XStack, YStack, shadows } from "@fundacja-peryskop/ui";
import { Roles, translatedRoles } from "../../constants";
import ChangeAvatar from "../ChangeAvatar";

interface Props {
    username: string;
    role: Roles;
    avatar_url?: string;
    isOwner: boolean;
    onSubmit: (values: { avatar: File }) => void;
}

/**
 * Profile header card: the avatar (with a white ring that lifts it off the cover
 * band) beside the user's name and a role pill. Sits on a clean surface and
 * stacks gracefully on narrow screens.
 */
const UserProfileHeading = ({ role, username, avatar_url, isOwner, onSubmit }: Props) => {
    return (
        <YStack
            tag="header"
            width="100%"
            padding="$xl"
            borderRadius="$lg"
            backgroundColor="$background"
            {...shadows.small}
        >
            <XStack alignItems="center" gap="$xl" flexWrap="wrap">
                <Stack borderRadius="$md" borderWidth={4} borderColor="$background" {...shadows.medium}>
                    <ChangeAvatar disabled={!isOwner} avatar={avatar_url} username={username} onSubmit={onSubmit} />
                </Stack>

                <YStack gap="$sm" flex={1} minWidth={200}>
                    <Typography variant="title2" tag="h1">
                        {username}
                    </Typography>
                    <XStack
                        alignSelf="flex-start"
                        paddingHorizontal="$md"
                        paddingVertical="$xs"
                        borderRadius="$full"
                        backgroundColor="$primarySoft"
                    >
                        <Typography variant="smallSemibold" color="$primaryTextSoft">
                            {translatedRoles[role]}
                        </Typography>
                    </XStack>
                </YStack>
            </XStack>
        </YStack>
    );
};

export default UserProfileHeading;
