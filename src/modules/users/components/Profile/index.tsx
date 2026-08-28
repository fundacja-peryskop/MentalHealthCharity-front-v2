import { Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { Roles, translatedRoles } from "../../constants";
import ChangeAvatar from "../ChangeAvatar";

interface Props {
    username: string;
    role: Roles;
    avatar_url?: string;
    isOwner: boolean;
    onSubmit: (values: { avatar: File }) => void;
}

const UserProfileHeading = ({ role, username, avatar_url, isOwner, onSubmit }: Props) => {
    return (
        <XStack alignItems="flex-end" gap="$lg" flexWrap="wrap">
            <ChangeAvatar disabled={!isOwner} avatar={avatar_url} username={username} onSubmit={onSubmit} />
            <YStack gap="$xs" paddingBottom="$xs">
                <Typography variant="title2" tag="h1">
                    {username}
                </Typography>
                <Typography variant="largeSemibold" color="$primary">
                    {translatedRoles[role]}
                </Typography>
            </YStack>
        </XStack>
    );
};

export default UserProfileHeading;
