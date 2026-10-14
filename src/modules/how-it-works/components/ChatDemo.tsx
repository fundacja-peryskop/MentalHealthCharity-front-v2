import { Avatar, Stack, Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { FastForward, RotateCcw, SendHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
import { useUser } from "../../auth/components/AuthProvider";
import { useIconColor } from "../../layout/useIconColor";
import { GET_HELP_HREF, personaOrder, personas, script } from "../content";
import { useChatPlayback } from "../hooks/useChatPlayback";
import { MessageBubble } from "./MessageBubble";
import { personaAvatar } from "./personaAvatar";
import { TypingIndicator } from "./TypingIndicator";

/**
 * Window shell + scrollable message log. The log has a fixed height and scrolls
 * internally like a real chat, following new messages while the reader is at
 * the bottom (it never scrolls the page itself).
 */
const CLASS = "hiw-chat";
const STYLE = `
.${CLASS}{position:relative;width:100%;max-width:720px;border-radius:28px;overflow:hidden;
  box-shadow:0 30px 70px rgba(9,10,10,.12),0 2px 6px rgba(9,10,10,.04);}
.${CLASS}__log{height:clamp(440px,64vh,620px);overflow-y:auto;scroll-behavior:auto;}
.${CLASS}__action-label{display:inline-flex;}
.${CLASS}__composer{display:block;text-decoration:none;cursor:pointer;}
.${CLASS}__composer:focus-visible{outline:3px solid #06b7a7;outline-offset:-3px;}
.${CLASS}__composer .${CLASS}__composer-field,.${CLASS}__composer .${CLASS}__composer-send{transition:background-color .2s ease;}
.${CLASS}__composer:hover .${CLASS}__composer-field{background-color:#f2f4f5;}
.${CLASS}__composer:hover .${CLASS}__composer-send{background-color:#06b7a7;}
.${CLASS}__composer:hover .${CLASS}__composer-send svg{stroke:#ffffff;}
@media (max-width:519.98px){.${CLASS}__action-label{display:none;}}
`;

/** How close (px) to the bottom still counts as "following" the conversation. */
const FOLLOW_THRESHOLD = 96;

/**
 * Animated demo conversation for "Jak to działa": three personas explain how
 * Peryskop works, one message at a time with typing indicators, ending with the
 * two calls to action. Starts when scrolled into view; can be skipped and
 * replayed. The log is an `aria-live` region so new messages are announced.
 */
export function ChatDemo() {
    const { t } = useTranslation();
    const { user } = useUser();
    const icon = useIconColor();
    const shellRef = useRef<HTMLDivElement>(null);
    const logRef = useRef<HTMLDivElement>(null);
    const followRef = useRef(true);
    const [inView, setInView] = useState(false);

    // A signed-in person already assigned to a chat goes straight to it - the
    // same rule as the homepage pitch cards.
    const resolveHref = (href: string) => (user?.is_assigned_to_chat ? "/chat" : href);

    const messages = useMemo(
        () =>
            script.map((message) => ({
                ...message,
                persona: personas[message.from],
                name: t(personas[message.from].nameKey),
                role: t(personas[message.from].roleKey),
                text: t(message.textKey),
            })),
        [t]
    );

    const { shown, typing, done, animated, skip, replay } = useChatPlayback(messages, inView);

    // Start the conversation once the window is meaningfully on screen.
    useEffect(() => {
        const node = shellRef.current;
        if (!node || typeof IntersectionObserver === "undefined") {
            setInView(true);
            return;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.35 }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    // Follow the newest message (or typing indicator) while the reader is at the
    // bottom. Deliberately instant: a smooth scroll still in flight when the next
    // message grows the log looks "scrolled away" to `onLogScroll`, which would
    // then stop following. Each bubble already animates in on its own.
    useEffect(() => {
        const log = logRef.current;
        if (!log || !followRef.current) return;
        log.scrollTop = log.scrollHeight;
    }, [shown, typing]);

    const onLogScroll = () => {
        const log = logRef.current;
        if (!log) return;
        followRef.current = log.scrollHeight - log.scrollTop - log.clientHeight < FOLLOW_THRESHOLD;
    };

    const handleReplay = () => {
        followRef.current = true;
        logRef.current?.scrollTo({ top: 0 });
        replay();
    };

    const actionLabel = done ? t("how_it_works.replay") : t("how_it_works.skip");
    const visible = messages.slice(0, shown);
    const typingMessage = typing !== null ? messages[typing] : null;

    return (
        <div ref={shellRef} className={CLASS}>
            <style>{STYLE}</style>
            <YStack backgroundColor="$background" borderWidth={1} borderColor="$borderColor" borderRadius={28}>
                {/* Header: the three people, a status line, and skip / replay. */}
                <XStack
                    alignItems="center"
                    gap="$md"
                    paddingHorizontal="$lg"
                    paddingVertical="$md"
                    borderBottomWidth={1}
                    borderColor="$borderColor"
                >
                    <Avatar.Group size={40} spacing={12}>
                        {personaOrder.map((id) => personaAvatar(personas[id], t(personas[id].nameKey), 40, id))}
                    </Avatar.Group>
                    <YStack flex={1} minWidth={0}>
                        <Typography variant="regularBold" tag="h2" numberOfLines={1}>
                            {t("how_it_works.chat_title")}
                        </Typography>
                        <XStack alignItems="center" gap="$xs">
                            <Stack width={8} height={8} borderRadius="$full" backgroundColor="$success" />
                            <Typography variant="tinyRegular" muted numberOfLines={1}>
                                {t("how_it_works.chat_subtitle")}
                            </Typography>
                        </XStack>
                    </YStack>

                    {animated && (done || inView) ? (
                        <Stack
                            tag="button"
                            role="button"
                            aria-label={actionLabel}
                            onPress={done ? handleReplay : skip}
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="center"
                            gap="$xs"
                            paddingHorizontal="$md"
                            minWidth={40}
                            minHeight={40}
                            borderRadius="$full"
                            borderWidth={0}
                            cursor="pointer"
                            backgroundColor="$backgroundHover"
                            hoverStyle={{ backgroundColor: "$backgroundPress" }}
                        >
                            {done ? (
                                <RotateCcw size={16} color={icon.muted} />
                            ) : (
                                <FastForward size={16} color={icon.muted} />
                            )}
                            <span className={`${CLASS}__action-label`}>
                                <Typography variant="smallSemibold" color="$colorMuted">
                                    {actionLabel}
                                </Typography>
                            </span>
                        </Stack>
                    ) : null}
                </XStack>

                {/* Message log. */}
                <div
                    ref={logRef}
                    className={`${CLASS}__log`}
                    onScroll={onLogScroll}
                    role="log"
                    aria-live="polite"
                    aria-label={t("how_it_works.log_label")}
                >
                    <YStack gap="$sm" paddingHorizontal="$lg" paddingVertical="$xl">
                        <XStack justifyContent="center" marginBottom="$sm">
                            <Typography
                                variant="tinySemibold"
                                color="$colorMuted"
                                paddingHorizontal="$md"
                                paddingVertical={4}
                                borderRadius="$full"
                                backgroundColor="$backgroundHover"
                            >
                                {t("how_it_works.today")}
                            </Typography>
                        </XStack>

                        {visible.map((message, index) => {
                            const previous = messages[index - 1];
                            const next = index + 1 < shown ? messages[index + 1] : typingMessage;
                            return (
                                <Stack
                                    key={message.id}
                                    marginTop={previous && previous.from !== message.from ? "$md" : 0}
                                >
                                    <MessageBubble
                                        persona={message.persona}
                                        name={message.name}
                                        role={message.role}
                                        text={message.text}
                                        cta={
                                            message.cta
                                                ? {
                                                      ...message.cta,
                                                      href: resolveHref(message.cta.href),
                                                      label: t(message.cta.labelKey),
                                                  }
                                                : undefined
                                        }
                                        showHeader={!previous || previous.from !== message.from}
                                        showAvatar={!next || next.from !== message.from}
                                    />
                                </Stack>
                            );
                        })}

                        {typingMessage ? (
                            <Stack marginTop={shown > 0 && messages[shown - 1].from !== typingMessage.from ? "$md" : 0}>
                                <TypingIndicator persona={typingMessage.persona} name={typingMessage.name} />
                            </Stack>
                        ) : null}
                    </YStack>
                </div>

                {/* The composer looks like a real input, so people will try to type in it -
                    the whole bar is a link into the "get help" flow instead. */}
                <RouterLink
                    to={resolveHref(GET_HELP_HREF)}
                    className={`${CLASS}__composer`}
                    aria-label={t("how_it_works.cta.get_help")}
                >
                    <XStack
                        alignItems="center"
                        gap="$sm"
                        paddingHorizontal="$lg"
                        paddingVertical="$md"
                        borderTopWidth={1}
                        borderColor="$borderColor"
                    >
                        <XStack
                            className={`${CLASS}__composer-field`}
                            flex={1}
                            alignItems="center"
                            minHeight={44}
                            paddingHorizontal="$lg"
                            borderRadius="$full"
                            backgroundColor="$backgroundHover"
                        >
                            <Typography variant="regularRegular" color="$placeholderColor" aria-hidden>
                                {t("how_it_works.composer")}
                            </Typography>
                        </XStack>
                        <Stack
                            className={`${CLASS}__composer-send`}
                            width={44}
                            height={44}
                            borderRadius="$full"
                            alignItems="center"
                            justifyContent="center"
                            backgroundColor="$primarySoft"
                        >
                            <SendHorizontal size={20} color={icon.primary} aria-hidden />
                        </Stack>
                    </XStack>
                </RouterLink>
            </YStack>
        </div>
    );
}
