import { Chip } from "@fundacja-peryskop/ui";
import { Roles, translatedRoles } from "../../constants";
import { getRoleTone } from "../../roleTones";

interface Props {
    role: Roles;
}

/** Small filled pill with the role's name, colour-coded per role (grey fallback). */
const RoleChip = ({ role }: Props) => (
    <Chip size="sm" color={getRoleTone(role).chip} flexShrink={0}>
        {translatedRoles[role] ?? role}
    </Chip>
);

export default RoleChip;
