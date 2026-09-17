/* Test doubles intentionally provide only the fields consumed by each component. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import assert from "node:assert/strict";
import { test, afterEach } from "node:test";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useChatFeed from "../src/modules/chat/hooks/useChatFeed";
import useChatListSync from "../src/modules/chat/hooks/useChatListSync";
import AddParticipantModal from "../src/modules/chat/components/AddParticipantModal";
import CreateChatModal from "../src/modules/chat/components/CreateChatModal";
import ChatItem from "../src/modules/chat/components/ChatItem";
import { state } from "./chat-test-state";

let renderer: ReactTestRenderer;
let client: QueryClient;
let current: ReturnType<typeof useChatFeed>;
const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));
const page = (ids: number[], number = 1, revision = "one") => ({
    items: ids.map((id) => ({ id })),
    total: 4,
    page: number,
    pages: 2,
    size: 2,
    revision,
});
const response = (data: unknown, status = 200) =>
    Promise.resolve({ ok: status < 400, status, json: async () => data }) as any;
function Feed({ search = "" }) {
    current = useChatFeed({ size: 2, search });
    return null;
}
function Sync() {
    useChatListSync();
    return null;
}
function mount(children: React.ReactNode) {
    state.user = { id: 1, user_role: "VOLUNTEER" };
    client = new QueryClient({
        defaultOptions: { queries: { retry: false, retryDelay: 0, gcTime: 0 }, mutations: { gcTime: 0 } },
    });
    act(() => {
        renderer = create(<QueryClientProvider client={client}>{children}</QueryClientProvider>);
    });
}
async function settle(predicate: () => boolean) {
    for (let i = 0; i < 60 && !predicate(); i++)
        await act(async () => {
            await wait(5);
        });
    assert(predicate(), "State did not settle");
}
afterEach(() => {
    act(() => renderer?.unmount());
    client?.clear();
});

test("revision change restarts pagination without losing moved chats", async () => {
    let revision = "one";
    globalThis.fetch = async (input) => {
        const q = new URL(String(input), "http://local").searchParams;
        if (q.get("revision") && q.get("revision") !== revision) return response({ detail: "Chat list changed" }, 409);
        return response(
            page(q.get("page") === "2" ? [2, 4] : revision === "one" ? [1, 2] : [3, 1], Number(q.get("page")), revision)
        );
    };
    mount(<Feed />);
    await settle(() => !!current.data && !current.isFetching);
    revision = "two";
    await act(async () => {
        await current.loadNextPage();
    });
    await settle(() => current.data?.revision === "two" && !current.isFetching);
    await act(async () => {
        await current.loadNextPage();
    });
    await settle(() => current.data?.items.length === 4);
    assert.deepEqual(
        current.data?.items.map((x) => x.id),
        [3, 1, 2, 4]
    );
    assert.equal(current.isError, false);
});

test("filter changes during a pending fetch ignore the old response", async () => {
    let release: () => void;
    let oldSignal: AbortSignal;
    globalThis.fetch = async (input, init) => {
        const search = new URL(String(input), "http://local").searchParams.get("search");
        if (!search) {
            oldSignal = init?.signal as AbortSignal;
            await new Promise<void>((resolve) => {
                release = resolve;
            });
        }
        return response(page(search ? [9] : [1]));
    };
    mount(<Feed />);
    act(() =>
        renderer.update(
            <QueryClientProvider client={client}>
                <Feed search="Anna" />
            </QueryClientProvider>
        )
    );
    await settle(() => current.data?.items[0]?.id === 9);
    assert.equal(oldSignal.aborted, true);
    await act(async () => {
        release();
        await wait();
    });
    assert.equal(current.data?.items[0]?.id, 9);
});

test("failed list request exposes an error and can be retried", async () => {
    let fail = true;
    globalThis.fetch = () => response(fail ? { detail: "Unavailable" } : page([1]), fail ? 503 : 200);
    mount(<Feed />);
    await settle(() => current.isError);
    fail = false;
    await act(async () => {
        await current.refetch();
    });
    await settle(() => !!current.data && !current.isError);
});

test("WS invalidation refreshes the list, coalesces signals and resyncs on reconnect", async () => {
    let calls = 0;
    globalThis.fetch = () => {
        calls++;
        return response(page([calls]));
    };
    state.socketState = 1;
    mount(
        <>
            <Feed />
            <Sync />
        </>
    );
    await settle(() => !!current.data && !current.isFetching);
    const before = calls;
    act(() => {
        state.socketOptions.onMessage({ data: JSON.stringify({ type: "chat_list_changed", revision: "new" }) });
        state.socketOptions.onMessage({ data: JSON.stringify({ type: "chat_list_changed", revision: "new" }) });
        state.socketOptions.onMessage({ data: JSON.stringify({ type: "heartbeat" }) });
    });
    await act(async () => {
        await wait(180);
    });
    await settle(() => calls === before + 1 && !current.isFetching);
    act(() => state.socketOptions.onOpen());
    await act(async () => {
        await wait(180);
    });
    await settle(() => calls === before + 2 && !current.isFetching);
    assert.equal(state.socketOptions.shouldReconnect({ code: 1008 }), false);
    assert.equal(state.socketOptions.shouldReconnect({ code: 1006 }), true);
});

test("offline WS installs a fallback and removes it after reconnect", async () => {
    state.socketState = 3;
    const original = globalThis.setInterval;
    let fallback: () => void;
    globalThis.setInterval = ((fn, ms) => {
        assert.equal(ms, 30000);
        fallback = fn;
        return original(fn, ms);
    }) as any;
    globalThis.fetch = () => response(page([1]));
    try {
        mount(<Sync />);
    } finally {
        globalThis.setInterval = original;
    }
    assert.equal(typeof fallback, "function");
    let invalidations = 0;
    client.invalidateQueries = async () => {
        invalidations++;
    };
    act(() => fallback());
    await act(async () => {
        await wait(180);
    });
    assert.equal(invalidations, 2);
    state.socketState = 1;
    act(() =>
        renderer.update(
            <QueryClientProvider client={client}>
                <Sync />
            </QueryClientProvider>
        )
    );
});

test("participant dialog waits for success and retains selection after failure", async () => {
    let resolveFetch: (value: any) => void;
    let closed = 0;
    globalThis.fetch = () =>
        new Promise((resolve) => {
            resolveFetch = resolve;
        });
    mount(<AddParticipantModal open chat={{ id: 42 } as any} onClose={() => closed++} />);
    await act(async () => {
        renderer.root.findByType("search-user").props.onChange({ id: 7 });
    });
    await act(async () => {
        renderer.root.findByType("form").props.onSubmit({ preventDefault() {}, persist() {} });
        await wait();
    });
    assert.equal(closed, 0);
    await settle(
        () => renderer.root.findAllByType("button").find((b) => b.props.type === "submit")?.props.disabled === true
    );
    await act(async () => {
        resolveFetch(await response({ detail: "Cannot add" }, 409));
        await wait();
    });
    assert.equal(closed, 0);
    assert.equal(renderer.root.findByType("search-user").props.value.id, 7);
    await act(async () => {
        renderer.root.findByType("form").props.onSubmit({ preventDefault() {}, persist() {} });
        await wait();
    });
    await settle(
        () => renderer.root.findAllByType("button").find((b) => b.props.type === "submit")?.props.disabled === true
    );
    await act(async () => {
        resolveFetch(await response({ id: 42 }));
        await wait();
    });
    await settle(() => closed === 1);
});

test("null and blank chat names render a safe label", () => {
    mount(
        <>
            <ChatItem chat={{ id: 42, name: null, is_active: true, unread_count: 0 } as any} selected={false} />
            <ChatItem chat={{ id: 43, name: "  ", is_active: true, unread_count: 0 } as any} selected={false} />
        </>
    );
    const tree = JSON.stringify(renderer.toJSON());
    assert(tree.includes("Chat #42") && tree.includes("Chat #43"));
});

test("create dialog waits for success and preserves name after failure", async () => {
    let resolveFetch: (value: any) => void;
    let closed = 0;
    globalThis.fetch = () =>
        new Promise((resolve) => {
            resolveFetch = resolve;
        });
    mount(<CreateChatModal open onClose={() => closed++} />);
    await act(async () => {
        renderer.root
            .findAllByType("input")
            .find((input) => input.props.name === "name")!
            .props.onChange({ target: { name: "name", value: "Test chat" } });
    });
    await act(async () => {
        renderer.root.findByType("form").props.onSubmit({ preventDefault() {}, persist() {} });
        await wait();
    });
    assert.equal(closed, 0);
    await settle(
        () => renderer.root.findAllByType("button").find((b) => b.props.type === "submit")?.props.disabled === true
    );
    await act(async () => {
        resolveFetch(await response({ detail: "Cannot create" }, 503));
        await wait();
    });
    await settle(
        () => renderer.root.findAllByType("button").find((b) => b.props.type === "submit")?.props.disabled === false
    );
    assert.equal(closed, 0);
    assert.equal(
        renderer.root.findAllByType("input").find((input) => input.props.name === "name")!.props.value,
        "Test chat"
    );
    await act(async () => {
        renderer.root.findByType("form").props.onSubmit({ preventDefault() {}, persist() {} });
        await wait();
    });
    await settle(
        () => renderer.root.findAllByType("button").find((b) => b.props.type === "submit")?.props.disabled === true
    );
    await act(async () => {
        resolveFetch(await response({ id: 42 }));
        await wait();
    });
    await settle(() => closed === 1);
});

test("silent open socket triggers HTTP fallback and reconnect", async () => {
    state.socketState = 1;
    state.closedSockets = 0;
    const originalInterval = globalThis.setInterval;
    const originalNow = Date.now;
    let now = 100000;
    let tick: () => void;
    Date.now = () => now;
    globalThis.setInterval = ((fn, ms) => {
        tick = fn;
        return originalInterval(fn, ms);
    }) as any;
    try {
        mount(<Sync />);
        let invalidations = 0;
        client.invalidateQueries = async () => {
            invalidations++;
        };
        now += 30000;
        act(() => tick());
        assert.equal(state.closedSockets, 0);
        now += 70000;
        act(() => tick());
        await act(async () => {
            await wait(180);
        });
        assert.equal(invalidations, 2);
        assert.equal(state.closedSockets, 1);
        assert.equal(state.socketOptions.filter(), false);
    } finally {
        globalThis.setInterval = originalInterval;
        Date.now = originalNow;
    }
});

test("retry after a failed next page preserves and completes the list", async () => {
    let fail = true;
    globalThis.fetch = (input) => {
        const next = new URL(String(input), "http://local").searchParams.get("page") === "2";
        return next && fail
            ? response({ detail: "Unavailable" }, 503)
            : response(page(next ? [3, 4] : [1, 2], next ? 2 : 1));
    };
    mount(<Feed />);
    await settle(() => !!current.data && !current.isFetching);
    await act(async () => {
        await current.loadNextPage();
    });
    await settle(() => current.isError);
    assert.deepEqual(
        current.data?.items.map((chat) => chat.id),
        [1, 2]
    );
    fail = false;
    await act(async () => {
        await current.refetch();
    });
    await settle(() => !current.isError && current.data?.items.length === 4);
    assert.deepEqual(
        current.data?.items.map((chat) => chat.id),
        [1, 2, 3, 4]
    );
});

test("continuous change signals do not postpone synchronization indefinitely", async () => {
    state.socketState = 1;
    mount(<Sync />);
    let refreshes = 0;
    client.invalidateQueries = async () => {
        refreshes++;
    };
    for (let i = 0; i < 5; i++) {
        act(() =>
            state.socketOptions.onMessage({ data: JSON.stringify({ type: "chat_list_changed", revision: String(i) }) })
        );
        await act(async () => {
            await wait(80);
        });
    }
    assert(refreshes >= 4, "At least two refresh batches should run during the burst");
});
