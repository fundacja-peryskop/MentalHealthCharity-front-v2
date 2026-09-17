import { infiniteQueryOptions } from "@tanstack/react-query";
import { url } from "../../../api";
import getAuthHeaders from "../../auth/helpers/getAuthHeaders";
import { fetchJson } from "../../shared/helpers/fetchJson";
import { UserTimelineOptions, UserTimelineResponse } from "../types";

export const userTimelineQueryOptions = (options: Omit<UserTimelineOptions, "cursor">, enabled: boolean) =>
    infiniteQueryOptions({
        queryKey: ["matching", "user-timeline", options],
        initialPageParam: undefined as string | undefined,
        queryFn: ({ pageParam, signal }): Promise<UserTimelineResponse> =>
            fetchJson(url.matching.userTimeline({ ...options, cursor: pageParam }), {
                headers: getAuthHeaders(),
                signal,
            }),
        getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
        enabled,
        retry: false,
    });
