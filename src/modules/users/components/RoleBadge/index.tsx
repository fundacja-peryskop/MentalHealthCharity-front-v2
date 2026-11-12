import { Badge, Typography } from "@fundacja-peryskop/ui";
import { Roles, translatedRoles } from "../../constants";
import { getRoleTone } from "../../roleTones";

interface Props {
    role: Roles;
    /** `sm` for tight spots such as the sender line above a message. Defaults to `md`. */
    size?: "sm" | "md";
}

/**
 * The role as a coloured dot + label (DS `Badge`). Only the dot carries the
 * role colour: the label stays neutral, because the yellow and light-green
 * role colours are too light to read as text on white.
 */
const RoleBadge = ({ role, size = "md" }: Props) => (
    <Badge tone={getRoleTone(role).dot} size={size} flexShrink={0}>
        <Typography variant={size === "sm" ? "tinySemibold" : "smallSemibold"} color="$colorMuted">
            {translatedRoles[role] ?? role}
        </Typography>
    </Badge>
);

export default RoleBadge;
