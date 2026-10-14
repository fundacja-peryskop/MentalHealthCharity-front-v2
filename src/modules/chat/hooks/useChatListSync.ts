import Cookies from "js-cookie";
import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { url } from "../../../api";
import { useUser } from "../../auth/components/AuthProvider";

export default function useChatListSync() {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const timer = useRef<ReturnType<typeof setTimeout>>();
    const revision = useRef<string>();
    const refresh = useRef({ running: false, queued: false });
    const lastFrameAt = useRef(Date.now());
    const token = Cookies.get("token");
    const sync = useCallback(
        function scheduleSync() {
            const round = refresh.current;
            round.queued = true;
            if (timer.current || round.running) return;
            timer.current = setTimeout(async () => {
                timer.current = undefined;
                round.running = true;
                // A request already in flight may have captured state before this
                // event. Join it, then perform one fresh round so this event is not lost.
                round.queued =
                    queryClient.isFetching({ queryKey: ["chats"] }) > 0 ||
                    queryClient.isFetching({ queryKey: ["chat"] }) > 0;
                try {
                    await Promise.all([
                        queryClient.invalidateQueries({ queryKey: ["chats"] }, { cancelRefetch: false }),
                        queryClient.invalidateQueries({ queryKey: ["chat"] }, { cancelRefetch: false }),
                    ]);
                } finally {
                    if (refresh.current === round) {
                        round.running = false;
                        if (round.queued) scheduleSync();
                    }
                }
            }, 150);
        },
        [queryClient]
    );
    const { readyState, getWebSocket } = useWebSocket(user && token ? url.chat.connectChatList({ token }) : null, {
        onOpen: () => {
            lastFrameAt.current = Date.now();
            revision.current = undefined;
            sync();
        },
        onMessage: (event) => {
            lastFrameAt.current = Date.now();
            try {
                const message = JSON.parse(event.data);
                if (
                    message.type === "chat_list_changed" &&
                    typeof message.revision === "string" &&
                    message.revision !== revision.current
                ) {
                    revision.current = message.revision;
                    sync();
                }
            } catch {
                /* Ignore malformed frames; reconnect/fallback will synchronize. */
            }
        },
        filter: () => false, // Frames drive invalidation; do not rerender the navbar for heartbeats.
        shouldReconnect: (event) => event.code !== 1008,
        reconnectAttempts: Infinity,
        reconnectInterval: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    });
    useEffect(() => {
        if (!user) return;
        const interval = setInterval(() => {
            // Three missing transport heartbeats indicate a stale socket.
            const silent = Date.now() - lastFrameAt.current > 90000;
            if (readyState !== ReadyState.OPEN || silent) sync();
            if (readyState === ReadyState.OPEN && silent) getWebSocket()?.close();
        }, 30000);
        return () => clearInterval(interval);
    }, [user?.id, readyState, sync, getWebSocket]);
    useEffect(
        () => () => {
            if (timer.current) clearTimeout(timer.current);
            timer.current = undefined;
            refresh.current = { running: false, queued: false };
        },
        [user?.id]
    );
}
