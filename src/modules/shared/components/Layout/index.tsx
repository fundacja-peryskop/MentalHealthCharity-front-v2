import React, { useEffect } from "react";
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

const Layout = ({ children }: Props) => {
    const { pathname } = useLocation();
    const isAdminScreen = pathname.includes("/admin");
    const isChatScreen = pathname.startsWith("/chat");
    // The admin panel has its own sidebar layout, and the chat screen is a
    // full-height app view — both skip the global marketing chrome.
    const showGlobalChrome = !isAdminScreen && !isChatScreen;

    useEffect(() => {
        document.documentElement.classList.toggle("chat-route", isChatScreen);
        document.body.classList.toggle("chat-route", isChatScreen);

        return () => {
            document.documentElement.classList.remove("chat-route");
            document.body.classList.remove("chat-route");
        };
    }, [isChatScreen]);

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
            {showGlobalChrome && <AnnouncementBar />}
            {showGlobalChrome && <AppHeader />}
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
