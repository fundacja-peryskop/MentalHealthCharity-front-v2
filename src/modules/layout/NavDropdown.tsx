import { Typography, XStack, YStack } from "@fundacja-peryskop/ui";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type FocusEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
import type { NavGroup } from "./content";
import { isActiveHref } from "./navigation";
import { useIconColor } from "./useIconColor";

/**
 * Plain elements for the positioned shell and the trigger: on Tamagui stacks
 * their atomic `position` / `display` classes would win over these rules.
 */
const CLASS = "nav-dropdown";
const STYLE = `
@keyframes ${CLASS}-in{from{opacity:0;transform:translate(-50%,-6px);}to{opacity:1;transform:translate(-50%,0);}}
.${CLASS}{position:relative;display:inline-flex;}
.${CLASS}__trigger{display:inline-flex;align-items:center;gap:4px;padding:0;margin:0;border:0;background:none;cursor:pointer;font:inherit;}
.${CLASS}__trigger:focus-visible{outline:3px solid #06b7a7;outline-offset:4px;border-radius:6px;}
.${CLASS}__chevron{transition:transform .18s ease;}
.${CLASS}__chevron--open{transform:rotate(180deg);}
.${CLASS}__panel{position:absolute;top:calc(100% + 14px);left:50%;transform:translateX(-50%);z-index:60;min-width:232px;
  border-radius:16px;box-shadow:0 16px 40px rgba(9,10,10,.14);animation:${CLASS}-in .18s cubic-bezier(.22,1,.36,1);}
.${CLASS}__link{display:block;text-decoration:none;border-radius:12px;}
.${CLASS}__link:focus-visible{outline:3px solid #06b7a7;outline-offset:-3px;}
@media (prefers-reduced-motion:reduce){.${CLASS}__panel{animation:none;}.${CLASS}__chevron{transition:none;}}
`;

interface NavDropdownProps {
    group: NavGroup;
    pathname: string;
}

/**
 * Desktop header dropdown for a group of links (disclosure pattern: a button
 * that shows and hides a list of plain links, the recommended pattern for site
 * navigation). Closes on Escape (focus returns to the button), on a click
 * outside, when focus leaves it, and after navigating. The trigger is
 * highlighted while one of its pages is open.
 */
export function NavDropdown({ group, pathname }: NavDropdownProps) {
    const icon = useIconColor();
    // The path the panel was opened on: it counts as open only while still on
    // that path, so following one of its links closes it without an effect.
    const [openedAt, setOpenedAt] = useState<string | null>(null);
    const open = openedAt === pathname;
    const setOpen = (next: boolean) => setOpenedAt(next ? pathname : null);
    const [hovered, setHovered] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelId = `${CLASS}-${group.id}`;
    const isSectionActive = group.items.some((item) => isActiveHref(item.href, pathname));
    const highlighted = open || hovered || isSectionActive;

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) setOpenedAt(null);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            setOpenedAt(null);
            triggerRef.current?.focus();
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    // Tabbing past the last link closes the panel.
    const onBlur = (event: FocusEvent<HTMLDivElement>) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node | null)) setOpen(false);
    };

    return (
        <div ref={rootRef} className={CLASS} onBlur={onBlur}>
            <style>{STYLE}</style>
            <button
                ref={triggerRef}
                type="button"
                className={`${CLASS}__trigger`}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen(!open)}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            >
                <Typography variant="regularSemibold" tag="span" color={highlighted ? "$primary" : "$color"}>
                    {group.label}
                </Typography>
                <ChevronDown
                    size={18}
                    aria-hidden
                    className={`${CLASS}__chevron${open ? ` ${CLASS}__chevron--open` : ""}`}
                    color={highlighted ? icon.primary : icon.color}
                />
            </button>

            {open ? (
                <div id={panelId} className={`${CLASS}__panel`}>
                    <YStack
                        backgroundColor="$background"
                        borderRadius={16}
                        borderWidth={1}
                        borderColor="$borderColor"
                        padding="$xs"
                        gap={2}
                    >
                        {group.items.map((item) => {
                            const active = isActiveHref(item.href, pathname);
                            return (
                                <RouterLink
                                    key={item.href}
                                    to={item.href}
                                    className={`${CLASS}__link`}
                                    aria-current={active ? "page" : undefined}
                                >
                                    <XStack
                                        minHeight={44}
                                        alignItems="center"
                                        paddingHorizontal="$md"
                                        borderRadius={12}
                                        backgroundColor={active ? "$primarySoft" : "$backgroundTransparent"}
                                        hoverStyle={{ backgroundColor: active ? "$primarySoft" : "$backgroundHover" }}
                                        pressStyle={{ backgroundColor: active ? "$primarySoft" : "$backgroundPress" }}
                                    >
                                        <Typography
                                            variant="regularSemibold"
                                            tag="span"
                                            color={active ? "$primaryTextSoft" : "$color"}
                                        >
                                            {item.label}
                                        </Typography>
                                    </XStack>
                                </RouterLink>
                            );
                        })}
                    </YStack>
                </div>
            ) : null}
        </div>
    );
}
