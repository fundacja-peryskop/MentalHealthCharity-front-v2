// Central place for the "leaving the foundation" link-gate logic.
// Links to these hosts (and their subdomains) are treated as internal and open
// directly; everything else is routed through the warning gate at LEAVING_ROUTE.
const FOUNDATION_DOMAINS = ["fundacjaperyskop.org"];

// The foundation's one and only official fundraiser. Donations must go here.
export const OFFICIAL_FUNDRAISER_URL = "https://pomagam.pl/rw9bkc";

// Specific full URLs (path included) that are trusted even though their domain
// is not ours - e.g. the foundation's official fundraiser page. Only these exact
// pages skip the gate; the rest of the domain is still treated as external.
const ALLOWED_URLS = [OFFICIAL_FUNDRAISER_URL];

// Known donation / fundraising / tip platforms. A link to any of these (other
// than our own allowlisted fundraiser) is flagged as an "unofficial fundraiser"
// so users are steered to the official collection instead of donating elsewhere.
const DONATION_DOMAINS = [
    "pomagam.pl",
    "siepomaga.pl",
    "zrzutka.pl",
    "tiply.pl",
    "tiply.io",
    "gofundme.com",
    "patronite.pl",
    "buycoffee.to",
    "suppi.pl",
    "ko-fi.com",
    "patreon.com",
    "paypal.me",
    "revolut.me",
    "leetchi.com",
];

// Only real web links are ever turned into clickable elements. Anything using a
// dangerous scheme (javascript:, data:, vbscript:, ...) is rendered as plain text.
const SAFE_PROTOCOLS = ["http:", "https:"];

// Top-level domains frequently abused for phishing/scams. Links using them are
// blocked outright rather than shown with a "continue anyway" option. Tune this
// list as needed - it is intentionally cautious for a vulnerable audience.
const SUSPICIOUS_TLDS = [
    ".ru",
    ".su",
    ".tk",
    ".ml",
    ".ga",
    ".cf",
    ".gq",
    ".zip",
    ".mov",
    ".xyz",
    ".top",
    ".click",
    ".work",
    ".loan",
    ".rest",
];

export const LEAVING_ROUTE = "/leaving";
export const LEAVING_URL_PARAM = "url";

/** Reasons a link is considered dangerous and gets blocked (no "continue"). */
export type UrlThreat = "insecure" | "ip-host" | "punycode" | "userinfo" | "impersonation" | "suspicious-tld";

/**
 * Parses a raw href and returns a URL only when it uses a safe web protocol.
 * Returns null for javascript:/data:/mailto:/relative/malformed inputs, so the
 * caller can safely fall back to rendering plain text.
 */
export function parseSafeHttpUrl(href: string): URL | null {
    try {
        const url = new URL(href);
        if (!SAFE_PROTOCOLS.includes(url.protocol)) return null;
        return url;
    } catch {
        return null;
    }
}

/** True when the host is the foundation (or a subdomain) or the current app origin. */
export function isInternalUrl(url: URL): boolean {
    const host = url.hostname.toLowerCase();
    if (typeof window !== "undefined" && host === window.location.hostname.toLowerCase()) {
        return true;
    }
    return FOUNDATION_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

/** Canonical origin+path key, ignoring trailing slash, query string and hash. */
function urlKey(url: URL): string {
    const path = url.pathname.replace(/\/+$/, "");
    return `${url.protocol}//${url.host.toLowerCase()}${path}`;
}

const ALLOWED_URL_KEYS = new Set(
    ALLOWED_URLS.map((raw) => {
        try {
            return urlKey(new URL(raw));
        } catch {
            return raw;
        }
    })
);

/** True when the URL exactly matches an allowlisted page (origin + path only). */
export function isAllowlistedUrl(url: URL): boolean {
    return ALLOWED_URL_KEYS.has(urlKey(url));
}

/**
 * True when a link may be opened directly, skipping the warning gate: our own
 * domains, the current app origin, or an explicitly allowlisted page.
 */
export function isTrustedUrl(url: URL): boolean {
    return isInternalUrl(url) || isAllowlistedUrl(url);
}

/**
 * True when the URL points at a known donation/fundraising platform but is NOT
 * our own allowlisted fundraiser - i.e. a potentially unofficial collection the
 * user should be warned about.
 */
export function isDonationPlatformUrl(url: URL): boolean {
    if (isAllowlistedUrl(url)) return false;
    const host = url.hostname.toLowerCase();
    return DONATION_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

/** True when the host is a bare IP address (IPv4 or IPv6) instead of a domain name. */
function isIpHost(host: string): boolean {
    // IPv6 hosts are wrapped in brackets by the URL parser, e.g. "[::1]".
    if (host.startsWith("[")) return true;
    // IPv4 dotted-quad.
    return /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
}

/**
 * Inspects an external URL for signs that it is unsafe. Any returned threat
 * means the link should be blocked (not offered with a "continue anyway" step).
 */
export function assessUrlThreats(url: URL): UrlThreat[] {
    const threats: UrlThreat[] = [];
    const host = url.hostname.toLowerCase();

    // Not encrypted - passwords/data could be intercepted in transit.
    if (url.protocol === "http:") threats.push("insecure");

    // Raw IP address instead of a real site name.
    if (isIpHost(host)) threats.push("ip-host");

    // Punycode / internationalized host - classic homograph spoofing trick.
    if (host.includes("xn--")) threats.push("punycode");

    // Embedded credentials (e.g. http://fundacjaperyskop.org@evil.com) hide the real host.
    if (url.username || url.password) threats.push("userinfo");

    // Pretends to be the foundation without being an allowlisted domain.
    if (host.includes("peryskop") && !isInternalUrl(url)) threats.push("impersonation");

    // Top-level domain frequently abused for scams.
    if (SUSPICIOUS_TLDS.some((tld) => host.endsWith(tld))) threats.push("suspicious-tld");

    return threats;
}

/** Convenience: true when the URL has at least one blocking threat. */
export function isDangerousUrl(url: URL): boolean {
    return assessUrlThreats(url).length > 0;
}

/** Builds the internal route that renders the leaving-warning gate for a target url. */
export function buildLeavingUrl(target: string): string {
    return `${LEAVING_ROUTE}?${LEAVING_URL_PARAM}=${encodeURIComponent(target)}`;
}
