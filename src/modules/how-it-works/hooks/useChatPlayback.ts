import { useCallback, useEffect, useRef, useState } from "react";

/** Gap between one message landing and the next person starting to type. */
const GAP_MS = 750;
/** "Typing" time scales with message length so longer messages feel natural. */
const TYPING_BASE_MS = 500;
const TYPING_PER_CHAR_MS = 20;
const TYPING_MIN_MS = 950;
const TYPING_MAX_MS = 2600;

export interface PlaybackStep {
    /** Resolved message text - only its length is used, to pace the typing. */
    text: string;
    pauseBeforeMs?: number;
}

export interface ChatPlayback {
    /** How many messages are currently revealed. */
    shown: number;
    /** Index of the message whose author is "typing", or `null`. */
    typing: number | null;
    /** Every message is revealed. */
    done: boolean;
    /** False under `prefers-reduced-motion` (everything is shown at once). */
    animated: boolean;
    /** Reveal everything immediately. */
    skip: () => void;
    /** Start the conversation again from the first message. */
    replay: () => void;
}

const prefersReducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

const typingDuration = (text: string) =>
    Math.min(TYPING_MAX_MS, Math.max(TYPING_MIN_MS, TYPING_BASE_MS + text.length * TYPING_PER_CHAR_MS));

/**
 * Plays a scripted conversation: for each message, wait a beat, show the
 * author's typing indicator for a length-based time, then reveal the message.
 * Playback starts once `active` turns true (e.g. when the chat scrolls into
 * view). Under `prefers-reduced-motion` the whole conversation is shown at once.
 */
export function useChatPlayback(steps: PlaybackStep[], active: boolean): ChatPlayback {
    const total = steps.length;
    const [shown, setShown] = useState(() => (prefersReducedMotion() ? total : 0));
    const [typing, setTyping] = useState<number | null>(null);
    // Bumped by `replay` to restart the timer chain.
    const [run, setRun] = useState(0);
    const timers = useRef<number[]>([]);

    const clearTimers = useCallback(() => {
        timers.current.forEach((id) => window.clearTimeout(id));
        timers.current = [];
    }, []);

    // Steps are read through a ref so a re-render (e.g. a language switch that
    // re-resolves the text) does not restart the conversation.
    const stepsRef = useRef(steps);
    stepsRef.current = steps;

    useEffect(() => {
        if (!active || prefersReducedMotion()) return;

        let elapsed = 0;
        const schedule = (delay: number, fn: () => void) => {
            elapsed += delay;
            timers.current.push(window.setTimeout(fn, elapsed));
        };

        stepsRef.current.forEach((step, index) => {
            schedule(index === 0 ? 300 : GAP_MS + (step.pauseBeforeMs ?? 0), () => setTyping(index));
            schedule(typingDuration(step.text), () => {
                setTyping(null);
                setShown(index + 1);
            });
        });

        return clearTimers;
    }, [active, run, clearTimers]);

    const skip = useCallback(() => {
        clearTimers();
        setTyping(null);
        setShown(total);
    }, [clearTimers, total]);

    const replay = useCallback(() => {
        clearTimers();
        setTyping(null);
        // Without motion there is nothing to replay - keep the full conversation.
        if (prefersReducedMotion()) {
            setShown(total);
            return;
        }
        setShown(0);
        setRun((value) => value + 1);
    }, [clearTimers, total]);

    return { shown, typing, done: shown >= total, animated: !prefersReducedMotion(), skip, replay };
}
