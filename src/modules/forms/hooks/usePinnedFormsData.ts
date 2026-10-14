import { useQueries } from "@tanstack/react-query";
import { getFormByIdQueryOptions } from "../queries/getFormsQueryOptions";
import { FormResponse, MenteeForm, VolunteerForm } from "../types";

/** Pinned forms are a stable working set — no need to refetch them on every window focus. */
const PINNED_FORM_STALE_TIME = 5 * 60 * 1000;

export interface PinnedFormEntry {
    id: number;
    form?: FormResponse<MenteeForm | VolunteerForm>;
    isPending: boolean;
}

/**
 * Resolves pinned ids into full forms. Fetching by id (instead of picking them out of the
 * paginated list) keeps a pinned form visible no matter which status filter or sorting is active.
 */
export const usePinnedFormsData = (pinnedIds: number[]): PinnedFormEntry[] => {
    const results = useQueries({
        queries: pinnedIds.map((id) => ({
            ...getFormByIdQueryOptions({ id }),
            staleTime: PINNED_FORM_STALE_TIME,
            refetchOnWindowFocus: false,
        })),
    });

    return pinnedIds.map((id, index) => ({
        id,
        form: results[index]?.data,
        isPending: results[index]?.isPending ?? true,
    }));
};
