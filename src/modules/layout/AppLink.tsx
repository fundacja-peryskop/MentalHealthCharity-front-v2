import { Typography, type TypographyProps } from "@fundacja-peryskop/ui";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

export interface AppLinkProps extends Omit<TypographyProps, "children"> {
    href: string;
    /** Force an external anchor (new tab). Inferred for tel/mailto/http hrefs. */
    external?: boolean;
    children: ReactNode;
}

/** tel:, mailto: and absolute http(s) URLs are not React Router routes. */
function isNonRouterHref(href: string): boolean {
    return /^(tel:|mailto:|https?:\/\/)/.test(href);
}

const ANCHOR_RESET: React.CSSProperties = {
    textDecoration: "none",
    display: "inline-flex",
    color: "inherit",
};

/**
 * A design-system-styled text link that keeps internal navigation within the
 * SPA (React Router) while still rendering a real, crawlable `<a href>`.
 * External / tel / mailto targets render a plain anchor (new tab when external).
 * Styling is delegated to `Typography` so callers pass `variant`, `color`, etc.
 */
export function AppLink({ href, external, children, ...typographyProps }: AppLinkProps) {
    const content = (
        <Typography tag="span" cursor="pointer" {...typographyProps}>
            {children}
        </Typography>
    );

    if (external || isNonRouterHref(href)) {
        return (
            <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                style={ANCHOR_RESET}
            >
                {content}
            </a>
        );
    }

    return (
        <RouterLink to={href} style={ANCHOR_RESET}>
            {content}
        </RouterLink>
    );
}
