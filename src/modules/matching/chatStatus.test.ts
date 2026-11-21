import { describe, expect, it } from "vitest";
import {
    chatStatusPollInterval,
    IDLE_POLL_MS,
    isSupportFlowRoute,
    needsMatchingEmptyState,
    NEUTRAL_CHAT_STATUS,
    SEARCHING_POLL_MS,
} from "./chatStatus";
import { ChatStatusKind, type MyChatStatus } from "./types";

const withStatus = (status: ChatStatusKind): MyChatStatus => ({ ...NEUTRAL_CHAT_STATUS, status });

describe("needsMatchingEmptyState", () => {
    it("is false while there is a conversation, for staff and before the status is known", () => {
        expect(needsMatchingEmptyState(withStatus(ChatStatusKind.IN_CONVERSATION))).toBe(false);
        expect(needsMatchingEmptyState(withStatus(ChatStatusKind.NOT_APPLICABLE))).toBe(false);
        expect(needsMatchingEmptyState(undefined)).toBe(false);
    });

    it("is true for every situation without a conversation", () => {
        const waiting = Object.values(ChatStatusKind).filter(
            (kind) => kind !== ChatStatusKind.IN_CONVERSATION && kind !== ChatStatusKind.NOT_APPLICABLE
        );
        expect(waiting).toHaveLength(6);
        for (const kind of waiting) {
            expect(needsMatchingEmptyState(withStatus(kind))).toBe(true);
        }
    });
});

describe("chatStatusPollInterval", () => {
    it("polls often while someone is being searched for", () => {
        expect(chatStatusPollInterval(withStatus(ChatStatusKind.MENTEE_SEARCHING))).toBe(SEARCHING_POLL_MS);
        expect(chatStatusPollInterval(withStatus(ChatStatusKind.VOLUNTEER_SEARCHING))).toBe(SEARCHING_POLL_MS);
    });

    it("keeps a slow heartbeat for situations that change elsewhere", () => {
        for (const kind of [
            ChatStatusKind.MENTEE_IDLE,
            ChatStatusKind.VOLUNTEER_UNAVAILABLE,
            ChatStatusKind.VOLUNTEER_AVAILABILITY_MISSING,
            ChatStatusKind.VOLUNTEER_PAUSED,
        ]) {
            expect(chatStatusPollInterval(withStatus(kind))).toBe(IDLE_POLL_MS);
        }
        expect(IDLE_POLL_MS).toBeGreaterThan(SEARCHING_POLL_MS);
    });

    it("stops once there is a conversation (the chat list socket takes over)", () => {
        expect(chatStatusPollInterval(withStatus(ChatStatusKind.IN_CONVERSATION))).toBe(false);
        expect(chatStatusPollInterval(withStatus(ChatStatusKind.NOT_APPLICABLE))).toBe(false);
        expect(chatStatusPollInterval(undefined)).toBe(false);
    });
});

describe("isSupportFlowRoute", () => {
    it("covers the chat and the help form pages", () => {
        for (const path of ["/chat", "/chat/12", "/form/mentee", "/form/mentee-getting-started"]) {
            expect(isSupportFlowRoute(path), path).toBe(true);
        }
    });

    it("leaves every other page alone", () => {
        for (const path of ["/", "/articles", "/form/volunteer", "/chatroom", "/profile/3"]) {
            expect(isSupportFlowRoute(path), path).toBe(false);
        }
    });
});
