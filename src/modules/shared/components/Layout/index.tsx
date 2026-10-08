import React, { useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import MenteeRematchPrompt from "../../../matching/components/MenteeRematchPrompt";
import VolunteerAvailabilityPrompt from "../../../matching/components/VolunteerAvailabilityPrompt";
import { AnnouncementBar } from "../../../layout/AnnouncementBar";
import { AppHeader } from "../../../layout/AppHeader";
import { SiteFooter } from "../../../layout/SiteFooter";
import CookiesBar from "../CookiesBar";

interface Props {
    children: React.ReactNode;
}

/** Routes rendered as full-bleed, standalone auth pages (no global chrome). */
const AUTH_SCREEN_PATHS = new Set([
    "/login",
    "/auth/register",
    "/auth/confirm-email-begin",
    "/confirm",
    "/auth/forget-password",
    "/auth/forget-password-classic",
    "/reset-password",
]);

const Layout = ({ children }: Props) => {
    const { pathname } = useLocation();
    const isAdminScreen = pathname.includes("/admin");
    const isChatScreen = pathname.startsWith("/chat");
    // The auth screens are full-bleed, standalone split-screen pages.
    const isAuthScreen = AUTH_SCREEN_PATHS.has(pathname);
    // The admin panel has its own sidebar layout, the chat screen is a
    // full-height app view, and the auth screens are standalone - all skip the
    // global marketing chrome.
    const showGlobalChrome = !isAdminScreen && !isChatScreen && !isAuthScreen;

    // The announcement bar + header slide together as one sticky block. On
    // scroll-down the block shifts up by the bar's height so the bar tucks away
    // and the header pins flush to the top; near the top it slides back. Moving
    // them as a unit means the header always covers the bar (no peeking sliver).
    const [barCollapsed, setBarCollapsed] = useState(false);
    const barRef = useRef<HTMLDivElement>(null);
    const [barHeight, setBarHeight] = useState(58);
    const reduceMotion =
        typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // How far the header overlaps the bar (keep in sync with AppHeader's margin).
    const HEADER_OVERLAP = 16;

    useEffect(() => {
        document.documentElement.classList.toggle("chat-route", isChatScreen);
        document.body.classList.toggle("chat-route", isChatScreen);

        return () => {
            document.documentElement.classList.remove("chat-route");
            document.body.classList.remove("chat-route");
        };
    }, [isChatScreen]);

    useEffect(() => {
        if (!showGlobalChrome) return;
        let ticking = false;
        const update = () => {
            const y = window.scrollY;
            setBarCollapsed((prev) => {
                if (y <= 8) return false; // at the top → bar visible
                if (y > 24) return true; // scrolled down → hide the bar
                return prev; // hysteresis band: keep current state
            });
            ticking = false;
        };
        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        update();
        return () => window.removeEventListener("scroll", onScroll);
    }, [showGlobalChrome]);

    // Measure the bar so the chrome slides up exactly its (visible) height.
    useEffect(() => {
        if (!showGlobalChrome) return;
        const el = barRef.current;
        if (!el) return;
        const measure = () => setBarHeight(el.offsetHeight);
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        return () => observer.disconnect();
    }, [showGlobalChrome]);

    return (
        <div
            className={`bg-background font-ubuntu flex min-h-screen flex-col ${isChatScreen ? "h-[var(--app-viewport-height)]" : ""}`}
        >
            <a
                href="#main-content"
                className="bg-primary text-primary-foreground sr-only rounded-md px-4 py-2 font-medium focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200]"
            >
                Skip to main content
            </a>
            {showGlobalChrome && (
                <div
                    style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 50,
                        transform: barCollapsed ? `translateY(-${Math.max(0, barHeight - HEADER_OVERLAP)}px)` : "none",
                        transition: reduceMotion ? "none" : "transform 0.35s ease",
                    }}
                >
                    <div ref={barRef}>
                        <AnnouncementBar collapsed={barCollapsed} />
                    </div>
                    <AppHeader collapsed={barCollapsed} reduceMotion={reduceMotion} />
                </div>
            )}
            <Toaster
                toastOptions={{
                    style: {
                        fontFamily: "Ubuntu, sans-serif",
                        fontSize: "18px",
                    },
                }}
                position="top-center"
                reverseOrder={false}
            />
            <main id="main-content" className={`flex-1 ${isChatScreen ? "flex min-h-0 flex-col" : ""}`}>
                {children}
            </main>
            <VolunteerAvailabilityPrompt />
            <MenteeRematchPrompt />
            {showGlobalChrome && <SiteFooter />}
            <CookiesBar />
        </div>
    );
};

export default Layout;
