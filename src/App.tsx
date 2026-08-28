import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import posthog from "posthog-js";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import ReactGA from "react-ga";
import { BrowserRouter } from "react-router-dom";
import { posthogKey } from "./api";
import { UserProvider } from "./modules/auth/components/AuthProvider";
import Layout from "./modules/shared/components/Layout";
import Loader from "./modules/shared/components/Loader";
import RootRouter from "./modules/shared/components/RootRouter";
import TechnicalBreakScreen from "./modules/shared/components/TechnicalBreakScreen";
import { APP_TIME_ZONE, parseApiDate } from "./modules/shared/helpers/dateTime";

const queryClient = new QueryClient();
const TECHNICAL_BREAK_FLAG = "technical-break";

interface TechnicalBreakPayload {
    endsAt?: string;
    description?: string;
}

const normalizeTechnicalBreakPayload = (payload: unknown): TechnicalBreakPayload => {
    if (payload === null || payload === undefined) {
        return {};
    }

    let parsedPayload: unknown = payload;

    if (typeof payload === "string") {
        try {
            parsedPayload = JSON.parse(payload);
        } catch {
            return {};
        }
    }

    if (!parsedPayload || typeof parsedPayload !== "object" || Array.isArray(parsedPayload)) {
        return {};
    }

    const data = parsedPayload as Record<string, unknown>;

    return {
        endsAt: typeof data.ends_at === "string" ? data.ends_at : undefined,
        description: typeof data.description === "string" ? data.description : undefined,
    };
};

const formatTechnicalBreakDate = (dateValue?: string): string | null => {
    if (!dateValue) {
        return null;
    }

    try {
        const parsedDate = parseApiDate(dateValue);

        if (Number.isNaN(parsedDate.getTime())) {
            return null;
        }

        return new Intl.DateTimeFormat("pl-PL", {
            dateStyle: "full",
            timeStyle: "short",
            timeZone: APP_TIME_ZONE,
        }).format(parsedDate);
    } catch {
        return null;
    }
};

function App() {
    const [isTechnicalBreakEnabled, setIsTechnicalBreakEnabled] = useState(false);
    const [technicalBreakPayload, setTechnicalBreakPayload] = useState<TechnicalBreakPayload>({});
    const posthogInitialized = useRef(false);

    useEffect(() => {
        const TRACKING_ID = "G-E3RQD3DF0T";
        ReactGA.initialize(TRACKING_ID);
        ReactGA.pageview(window.location.pathname + window.location.search);
    }, []);

    useEffect(() => {
        if (posthogInitialized.current || !posthogKey) {
            return;
        }

        posthogInitialized.current = true;

        const syncTechnicalBreakState = () => {
            try {
                const isEnabled = posthog.isFeatureEnabled(TECHNICAL_BREAK_FLAG) === true;
                const payload = posthog.getFeatureFlagPayload(TECHNICAL_BREAK_FLAG);

                setIsTechnicalBreakEnabled(isEnabled);
                setTechnicalBreakPayload(normalizeTechnicalBreakPayload(payload));
            } catch {
                setIsTechnicalBreakEnabled(false);
                setTechnicalBreakPayload({});
            }
        };

        posthog.init(posthogKey, {
            api_host: "https://eu.i.posthog.com",
            person_profiles: "identified_only",
            loaded: syncTechnicalBreakState,
            session_recording: {
                maskTextFn(text) {
                    // A simple email regex - you may want to use something more advanced
                    const emailRegex = /(\S+)@(\S+\.\S+)/g;

                    return text.trim().replace(emailRegex, (g1, g2) => {
                        // Replace each email with asterisks - ben@posthog.com becomes ***@***********
                        return "*".repeat(g1.length) + "@" + "*".repeat(g2.length);
                    });
                },
            },
        });

        posthog.onFeatureFlags(syncTechnicalBreakState);

        try {
            posthog.reloadFeatureFlags();
        } catch {
            // Keep app available if flag fetch fails.
        }

        syncTechnicalBreakState();
    }, []);

    const technicalBreakEndsAtFormatted = useMemo(
        () => formatTechnicalBreakDate(technicalBreakPayload.endsAt),
        [technicalBreakPayload.endsAt]
    );

    if (isTechnicalBreakEnabled) {
        return (
            <TechnicalBreakScreen
                description={technicalBreakPayload.description}
                endsAtFormatted={technicalBreakEndsAtFormatted}
            />
        );
    }

    return (
        <Suspense fallback={<Loader variant="fullscreen" />}>
            <QueryClientProvider client={queryClient}>
                <UserProvider>
                    <BrowserRouter>
                        <Layout>
                            <RootRouter />
                        </Layout>
                    </BrowserRouter>
                </UserProvider>
            </QueryClientProvider>
        </Suspense>
    );
}

export default App;
