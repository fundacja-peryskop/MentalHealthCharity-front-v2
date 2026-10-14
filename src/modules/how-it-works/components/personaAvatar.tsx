import { Avatar, Typography } from "@fundacja-peryskop/ui";
import type { Persona } from "../content";

/**
 * A persona's avatar: their initial on their own pale tint. Returned as a plain
 * `<Avatar>` element (not a wrapper component) so `Avatar.Group` can clone it
 * with its ring / overlap props.
 */
export function personaAvatar(persona: Persona, name: string, size: number, key?: string) {
    return (
        <Avatar
            key={key}
            name={name}
            size={size}
            backgroundColor={persona.tone.surface}
            fallback={
                <Typography
                    tag="span"
                    color={persona.tone.ink}
                    aria-hidden
                    style={{ fontSize: Math.round(size * 0.42), fontWeight: 700, lineHeight: "1" }}
                >
                    {name.charAt(0).toUpperCase()}
                </Typography>
            }
        />
    );
}
