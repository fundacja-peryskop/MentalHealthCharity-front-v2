import { Stack, Typography } from "@fundacja-peryskop/ui";
import { chatColor, chatInitials } from "../../helpers/chatColor";

interface Props {
    /** Chat (or room) name - drives both the deterministic colour and initials. */
    name: string;
    /** Circle diameter in px. Defaults to 44 (comfortable touch/read size). */
    size?: number;
    /** Dim the avatar for closed / inactive chats. */
    dimmed?: boolean;
    /** Optional 2px ring in the background colour (used when avatars overlap content). */
    ring?: boolean;
}

/**
 * Round, deterministically-coloured chat avatar showing the chat's initials.
 *
 * The colour comes from the shared `chatColor` helper so the *same* chat always
 * looks the same everywhere in the app. Built from DS primitives (`Stack` +
 * `Typography`) and palette-derived colours only - no arbitrary values.
 */
const ChatAvatar = ({ name, size = 44, dimmed = false, ring = false }: Props) => {
    const color = chatColor(name);
    const initials = chatInitials(name);
    // Initial sits at ~42% of the diameter - legible without crowding the circle.
    const fontSize = Math.round(size * 0.42);

    return (
        <Stack
            width={size}
            height={size}
            borderRadius="$full"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            style={{
                backgroundColor: color.bg,
                opacity: dimmed ? 0.55 : 1,
                ...(ring ? { boxShadow: "0 0 0 2px #ffffff" } : null),
            }}
            aria-hidden
        >
            <Typography variant="regularBold" style={{ color: color.text, fontSize, lineHeight: `${size}px` }}>
                {initials}
            </Typography>
        </Stack>
    );
};

export default ChatAvatar;
