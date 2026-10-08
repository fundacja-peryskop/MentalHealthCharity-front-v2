/* eslint-disable */
import { fetchJson } from "./fetchJson";

export const apiClient = {
    get: (url: string, opts?: RequestInit) => fetchJson(url, { method: "GET", ...opts }),
    post: (url: string, body?: any, opts?: RequestInit) =>
        fetchJson(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(opts?.headers ?? {}) },
            body: body ? JSON.stringify(body) : undefined,
            ...opts,
        }),
    put: (url: string, body?: any, opts?: RequestInit) =>
        fetchJson(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...(opts?.headers ?? {}) },
            body: body ? JSON.stringify(body) : undefined,
            ...opts,
        }),
    del: (url: string, opts?: RequestInit) => fetchJson(url, { method: "DELETE", ...opts }),

    /**
     * POST z FormData (multipart/form-data).
     * Nie ustawiamy ręcznie Content-Type - przeglądarka doda boundary.
     * Jeśli w opts.headers jest Content-Type, zostanie usunięty.
     */
    postFormData: (url: string, formData?: FormData, opts?: RequestInit) => {
        // przygotuj headers z usuniętym Content-Type (obsługuje Headers | object | array)
        const makeHeaders = (h?: RequestInit["headers"]) => {
            if (!h) return undefined;

            if (h instanceof Headers) {
                const newH = new Headers(h);
                newH.delete("Content-Type");
                newH.delete("content-type");
                return newH;
            }

            if (Array.isArray(h)) {
                // tablica par [key, value]
                const filtered = (h as [string, string][]).filter(([k]) => k.toLowerCase() !== "content-type");
                return filtered.length ? filtered : undefined;
            }

            // obiekt
            const obj = { ...(h as Record<string, string>) } as Record<string, string>;
            Object.keys(obj).forEach((k) => {
                if (k.toLowerCase() === "content-type") delete obj[k];
            });
            return Object.keys(obj).length ? obj : undefined;
        };

        const headers = makeHeaders(opts?.headers);

        return fetchJson(url, {
            method: "POST",
            body: formData,
            ...opts,
            headers,
        });
    },
};
