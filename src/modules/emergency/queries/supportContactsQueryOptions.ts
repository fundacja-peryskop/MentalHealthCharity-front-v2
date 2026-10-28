import { queryOptions, UseQueryOptions } from "@tanstack/react-query";
import { url } from "../../../api";
import getAuthHeaders from "../../auth/helpers/getAuthHeaders";
import handleApiError from "../../shared/helpers/handleApiError";
import { SupportContact } from "../types";

export const supportContactsQueryOptions = (
    additionals?: Omit<UseQueryOptions<SupportContact[]>, "queryKey" | "queryFn">
) =>
    queryOptions<SupportContact[]>({
        queryKey: ["supportContacts"],
        queryFn: async () => {
            const response = await fetch(url.supportContacts.read, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw handleApiError(response);
            }

            return response.json();
        },
        ...additionals,
    });
