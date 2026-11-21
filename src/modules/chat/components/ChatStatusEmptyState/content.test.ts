import { describe, expect, it } from "vitest";
import pl from "../../../../locales/pl.json";
import en from "../../../../locales/en.json";
import { NEUTRAL_CHAT_STATUS } from "../../../matching/chatStatus";
import { ChatStatusKind, type MyChatStatus } from "../../../matching/types";
import { AVAILABILITY_HREF, getEmptyStateContent, MENTEE_FORM_HREF, NEUTRAL_CONTENT } from "./content";

const status = (overrides: Partial<MyChatStatus>): MyChatStatus => ({ ...NEUTRAL_CHAT_STATUS, ...overrides });

const lookup = (dict: unknown, key: string) =>
    key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], dict);

/** Every status + flag combination the backend can send. */
const ALL_STATUSES: MyChatStatus[] = [
    ...Object.values(ChatStatusKind).map((kind) => status({ status: kind })),
    status({ status: ChatStatusKind.MENTEE_SEARCHING, is_rematch: true }),
    status({ status: ChatStatusKind.MENTEE_IDLE, can_request_support: true, has_previous_conversations: true }),
    status({ status: ChatStatusKind.VOLUNTEER_SEARCHING, has_previous_conversations: true, declared_capacity: 3 }),
];

const keysOf = (content: ReturnType<typeof getEmptyStateContent>) =>
    [
        content.titleKey,
        content.bodyKey,
        content.metaKey,
        content.notice?.titleKey,
        content.notice?.bodyKey,
        content.action?.labelKey,
        content.secondaryAction?.labelKey,
    ].filter((key): key is string => !!key);

describe("getEmptyStateContent", () => {
    it("has copy in both locales for every status", () => {
        for (const item of ALL_STATUSES) {
            for (const key of keysOf(getEmptyStateContent(item))) {
                expect(lookup(pl, key), `pl: ${key}`).toEqual(expect.any(String));
                expect(lookup(en, key), `en: ${key}`).toEqual(expect.any(String));
            }
        }
    });

    it("shows the searching periscope, progress and the crisis line to a waiting mentee", () => {
        const content = getEmptyStateContent(status({ status: ChatStatusKind.MENTEE_SEARCHING }));
        expect(content.illustration).toBe("periscope");
        expect(content.showProgress).toBe(true);
        expect(content.showCrisisLine).toBe(true);
        expect(content.notice?.icon).toBe("mail");
    });

    it("tells a mentee whose volunteer left that a new one is being found", () => {
        const fresh = getEmptyStateContent(status({ status: ChatStatusKind.MENTEE_SEARCHING }));
        const rematch = getEmptyStateContent(status({ status: ChatStatusKind.MENTEE_SEARCHING, is_rematch: true }));
        expect(rematch.titleKey).not.toBe(fresh.titleKey);
        expect(rematch.titleKey).toContain("mentee_rematch");
    });

    it("offers an idle mentee the form, or a contact when the form would not help", () => {
        const canAsk = getEmptyStateContent(status({ status: ChatStatusKind.MENTEE_IDLE, can_request_support: true }));
        expect(canAsk.action?.href).toBe(MENTEE_FORM_HREF);

        const cannotAsk = getEmptyStateContent(status({ status: ChatStatusKind.MENTEE_IDLE }));
        expect(cannotAsk.action).toBeUndefined();
        expect(cannotAsk.bodyKey).toContain("body_contact");
        expect(cannotAsk.showCrisisLine).toBe(true);
    });

    it("points an idle mentee with history to the archive", () => {
        const withHistory = getEmptyStateContent(
            status({ status: ChatStatusKind.MENTEE_IDLE, has_previous_conversations: true })
        );
        expect(withHistory.notice?.icon).toBe("history");
        expect(getEmptyStateContent(status({ status: ChatStatusKind.MENTEE_IDLE })).notice).toBeUndefined();
    });

    it("distinguishes a volunteer's first mentee from the next ones and shows their availability", () => {
        const first = getEmptyStateContent(
            status({ status: ChatStatusKind.VOLUNTEER_SEARCHING, declared_capacity: 2 })
        );
        const next = getEmptyStateContent(
            status({ status: ChatStatusKind.VOLUNTEER_SEARCHING, has_previous_conversations: true })
        );
        expect(first.titleKey).toContain("title_first");
        expect(next.titleKey).not.toContain("title_first");
        expect(first.values).toEqual({ count: 2 });
        expect(first.secondaryAction?.href).toBe(AVAILABILITY_HREF);
    });

    it("explains availability 0 and a missing declaration, with a way to change it", () => {
        for (const kind of [ChatStatusKind.VOLUNTEER_UNAVAILABLE, ChatStatusKind.VOLUNTEER_AVAILABILITY_MISSING]) {
            const content = getEmptyStateContent(status({ status: kind }));
            expect(content.illustration).toBe("resting");
            expect(content.action?.href).toBe(AVAILABILITY_HREF);
        }
    });

    it("never offers a self-service action to a volunteer paused by coordinators", () => {
        const content = getEmptyStateContent(status({ status: ChatStatusKind.VOLUNTEER_PAUSED }));
        expect(content.action).toBeUndefined();
        expect(content.secondaryAction).toBeUndefined();
    });

    it("falls back to the neutral state for staff, conversations and unknown status", () => {
        expect(getEmptyStateContent(undefined)).toBe(NEUTRAL_CONTENT);
        expect(getEmptyStateContent(status({ status: ChatStatusKind.NOT_APPLICABLE }))).toBe(NEUTRAL_CONTENT);
        expect(getEmptyStateContent(status({ status: ChatStatusKind.IN_CONVERSATION }))).toBe(NEUTRAL_CONTENT);
    });
});
