import { describe, expect, it } from "vitest";
import type { User } from "../../auth/types";
import { Roles } from "../../users/constants";
import type { Chat, Message } from "../types";
import {
    findFirstOwnMessageId,
    firstMessageNoticeKey,
    hasOwnMessage,
    isFirstMessageNoticeEligible,
} from "./firstMessageNotice";

const person = (id: number, user_role: Roles) => ({ id, user_role }) as User;
const mentee = person(1, Roles.USER);
const volunteer = person(2, Roles.VOLUNTEER);

const chat = (overrides: Partial<Chat> = {}) =>
    ({ chat_type: "SUPPORT", is_active: true, participants: [mentee, volunteer], ...overrides }) as Chat;

const message = (id: number, sender: User, extra: Partial<Message> = {}) =>
    ({ id, sender, content: "", creation_date: "", chat_id: 1, ...extra }) as Message;

describe("isFirstMessageNoticeEligible", () => {
    it("applies to a mentee in their support chat", () => {
        expect(isFirstMessageNoticeEligible(chat(), mentee)).toBe(true);
    });

    it("does not apply to volunteers, other chat types or outsiders", () => {
        expect(isFirstMessageNoticeEligible(chat(), volunteer)).toBe(false);
        expect(isFirstMessageNoticeEligible(chat({ chat_type: "GROUP" }), mentee)).toBe(false);
        expect(isFirstMessageNoticeEligible(chat({ participants: [volunteer] }), mentee)).toBe(false);
        expect(isFirstMessageNoticeEligible(undefined, mentee)).toBe(false);
        expect(isFirstMessageNoticeEligible(chat(), undefined)).toBe(false);
    });

    it("keeps applying after the chat was closed, so a shown notice stays in place", () => {
        expect(isFirstMessageNoticeEligible(chat({ is_active: false }), mentee)).toBe(true);
    });
});

describe("findFirstOwnMessageId", () => {
    it("finds the oldest own message in a newest-first list", () => {
        const messages = [message(5, mentee), message(4, volunteer), message(3, mentee), message(2, volunteer)];
        expect(findFirstOwnMessageId(messages, mentee.id)).toBe(3);
    });

    it("skips a first send that failed", () => {
        const messages = [message(9, mentee), message(8, mentee, { isFailed: true })];
        expect(findFirstOwnMessageId(messages, mentee.id)).toBe(9);
    });

    it("returns undefined when the person has not written yet", () => {
        expect(findFirstOwnMessageId([message(1, volunteer)], mentee.id)).toBeUndefined();
        expect(hasOwnMessage([message(1, volunteer)], mentee.id)).toBe(false);
        expect(hasOwnMessage([message(1, mentee)], mentee.id)).toBe(true);
    });
});

describe("firstMessageNoticeKey", () => {
    it("is scoped to the person and the chat", () => {
        expect(firstMessageNoticeKey(1, 7)).not.toBe(firstMessageNoticeKey(1, 8));
        expect(firstMessageNoticeKey(1, 7)).not.toBe(firstMessageNoticeKey(2, 7));
    });
});
