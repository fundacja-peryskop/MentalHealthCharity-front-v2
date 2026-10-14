import { Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { useTranslation } from "react-i18next";
import type { Persona } from "../content";
import { personaAvatar } from "./personaAvatar";

const CLASS = "hiw-typing";
/** Three dots rising in turn; static under reduced motion. */
const STYLE = `
@keyframes ${CLASS}-dot{0%,60%,100%{transform:translateY(0);opacity:.45;}30%{transform:translateY(-4px);opacity:1;}}
.${CLASS}__dot{width:7px;height:7px;border-radius:9999px;background:#6c7072;display:block;animation:${CLASS}-dot 1.2s ease-in-out infinite;}
.${CLASS}__dot:nth-child(2){animation-delay:.15s;}
.${CLASS}__dot:nth-child(3){animation-delay:.3s;}
@media (prefers-reduced-motion:reduce){.${CLASS}__dot{animation:none;opacity:.7;}}
`;

/** "<Name> is typing" - the author's avatar beside a bubble of bouncing dots. */
export function TypingIndicator({ persona, name }: { persona: Persona; name: string }) {
    const { t } = useTranslation();
    return (
        <XStack gap="$sm" alignItems="flex-end" className="chat-msg-in-left" aria-hidden>
            <style>{STYLE}</style>
            {personaAvatar(persona, name, 36)}
            <YStack gap={2} alignItems="flex-start">
                <Typography variant="tinySemibold" color="$colorMuted" paddingHorizontal="$xs">
                    {t("how_it_works.typing", { name })}
                </Typography>
                <XStack
                    gap={5}
                    alignItems="center"
                    paddingHorizontal="$lg"
                    paddingVertical={14}
                    backgroundColor="$backgroundStrong"
                    style={{ borderRadius: 18, borderBottomLeftRadius: 6 }}
                >
                    <span className={`${CLASS}__dot`} />
                    <span className={`${CLASS}__dot`} />
                    <span className={`${CLASS}__dot`} />
                </XStack>
            </YStack>
        </XStack>
    );
}
