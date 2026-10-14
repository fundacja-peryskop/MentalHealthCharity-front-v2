import { formatInTimeZone } from "date-fns-tz";
import { enUS, pl } from "date-fns/locale";
import { APP_TIME_ZONE, parseApiDate } from "../../shared/helpers/dateTime";

/**
 * Day bucket key (`yyyy-MM-dd`) computed in the app timezone. Used to group
 * messages by calendar day so we can insert Messenger-like date separators.
 */
export const messageDayKey = (date: string): string =>
    formatInTimeZone(parseApiDate(date), APP_TIME_ZONE, "yyyy-MM-dd");

export type DayDivider = { kind: "today" } | { kind: "yesterday" } | { kind: "date"; label: string };

/**
 * Describe the day a message was sent, relative to now, as today / yesterday /
 * an absolute localized date (e.g. "12 października 2026"). All comparisons are
 * done in the app timezone so the boundary matches the timestamps we show.
 */
export const describeMessageDay = (date: string, language: string): DayDivider => {
    const key = messageDayKey(date);
    const now = new Date();
    const todayKey = formatInTimeZone(now, APP_TIME_ZONE, "yyyy-MM-dd");
    const yesterdayKey = formatInTimeZone(new Date(now.getTime() - 86_400_000), APP_TIME_ZONE, "yyyy-MM-dd");

    if (key === todayKey) return { kind: "today" };
    if (key === yesterdayKey) return { kind: "yesterday" };

    const locale = language.startsWith("pl") ? pl : enUS;
    return { kind: "date", label: formatInTimeZone(parseApiDate(date), APP_TIME_ZONE, "d MMMM yyyy", { locale }) };
};
