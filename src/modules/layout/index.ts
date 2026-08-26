/**
 * Shared design-system layout helpers, reused across every migrated view.
 *
 * - `PageContainer` — centered, max-width content wrapper with responsive gutters.
 * - `AppLink` — DS-styled link that keeps internal navigation within the SPA.
 * - `CtaButton` — pill DS `Button` that navigates on press.
 * - `useIconColor` — resolves DS colour tokens for non-Tamagui elements (icons).
 */
export { PageContainer } from "./PageContainer";
export { AppLink, type AppLinkProps } from "./AppLink";
export { CtaButton, type CtaButtonProps } from "./CtaButton";
export { useIconColor } from "./useIconColor";
