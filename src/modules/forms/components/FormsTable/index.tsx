import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Pin, PinOff, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { AutoSizer, InfiniteLoader, List, type ListRowRenderer, WindowScroller } from "react-virtualized";
import { usePinnedForms } from "../../hooks/usePinnedForms";
import { PinnedFormEntry, usePinnedFormsData } from "../../hooks/usePinnedFormsData";
import { formNoteFields, FormResponse, formTypes, MenteeForm, VolunteerForm } from "../../types";
import FormRow, { FORM_ROW_COLUMN_COUNT, FORM_ROW_GRID_TEMPLATE_COLUMNS, FORM_ROW_MIN_WIDTH } from "../FormRow";
import PinnedFormsHeader from "../PinnedFormsHeader";
import RecruitmentManagerModal from "../RecruitmentManagerModal";

const ROW_HEIGHT = 50;
const SECTION_ROW_HEIGHT = 42;
const MESSAGE_ROW_HEIGHT = 56;
const INITIAL_SKELETON_ROW_COUNT = 6;

type FormItem = FormResponse<MenteeForm | VolunteerForm>;

/**
 * Pinned forms live in the same virtualized list as the paginated ones — a single row model keeps
 * both sections column-aligned and sharing one horizontal scroll container.
 */
type TableRow =
    | { kind: "pinned-header" }
    | { kind: "pinned-hint" }
    | { kind: "pinned"; entry: PinnedFormEntry }
    | { kind: "list-header" }
    | { kind: "form"; form: FormItem }
    | { kind: "empty" }
    | { kind: "loading" };

const ROW_HEIGHT_BY_KIND: Record<TableRow["kind"], number> = {
    "pinned-header": SECTION_ROW_HEIGHT,
    "pinned-hint": SECTION_ROW_HEIGHT,
    pinned: ROW_HEIGHT,
    "list-header": SECTION_ROW_HEIGHT,
    form: ROW_HEIGHT,
    empty: MESSAGE_ROW_HEIGHT,
    loading: ROW_HEIGHT,
};

interface Props {
    data: FormItem[];
    total: number;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    isInitialLoading?: boolean;
    loadMore: () => Promise<unknown>;
    renderStepAddnotation: (step: number) => string;
    onRefetch?: () => void | Promise<unknown>;
    formNoteKeys: formNoteFields[];
    /** Keeps the pinned board of one list from leaking into another. */
    pinScope: formTypes;
    isSearching?: boolean;
}

const FormsTable = ({
    data,
    total,
    hasNextPage,
    isFetchingNextPage,
    isInitialLoading,
    loadMore,
    renderStepAddnotation,
    onRefetch,
    formNoteKeys,
    pinScope,
    isSearching = false,
}: Props) => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const listRef = useRef<List | null>(null);
    const [selectedForm, setSelectedForm] = useState<FormItem | null>(null);
    const [isPinnedCollapsed, setIsPinnedCollapsed] = useState(false);
    const { pinnedIds, isPinned, togglePin, unpin, unpinAll, isFull, count, limit } = usePinnedForms(pinScope);
    const pinnedEntries = usePinnedFormsData(pinnedIds);

    const hasPins = !isSearching && pinnedIds.length > 0;
    // A pinned form is lifted to the top, so it must not show up a second time further down.
    const pinnedIdSet = new Set(pinnedIds);
    const listForms = hasPins ? data.filter((form) => !pinnedIdSet.has(form.id)) : data;

    const rows: TableRow[] = [];

    if (hasPins) {
        rows.push({ kind: "pinned-header" });

        if (!isPinnedCollapsed) {
            pinnedEntries.forEach((entry) => rows.push({ kind: "pinned", entry }));
        }

        rows.push({ kind: "list-header" });
    } else if (!isSearching) {
        rows.push({ kind: "pinned-hint" });
    }

    listForms.forEach((form) => rows.push({ kind: "form", form }));

    if (isInitialLoading) {
        for (let index = 0; index < INITIAL_SKELETON_ROW_COUNT; index++) {
            rows.push({ kind: "loading" });
        }
    } else if (hasNextPage) {
        rows.push({ kind: "loading" });
    } else if (listForms.length === 0) {
        rows.push({ kind: "empty" });
    }

    // Row heights depend only on the sequence of row kinds, so that is the exact cache key.
    const layoutSignature = rows.map((row) => row.kind).join("|");

    useEffect(() => {
        listRef.current?.recomputeRowHeights();
    }, [layoutSignature]);

    const isRowLoaded = ({ index }: { index: number }) => rows[index]?.kind !== "loading";

    const loadMoreRows = useCallback(
        async (_range: { startIndex: number; stopIndex: number }) => {
            if (!hasNextPage || isFetchingNextPage) {
                return;
            }

            await loadMore();
        },
        [hasNextPage, isFetchingNextPage, loadMore]
    );

    const handleTogglePin = useCallback(
        (id: number) => {
            if (togglePin(id) === "limit-reached") {
                toast.error(
                    t("pinned_forms.limit_reached", {
                        limit,
                        defaultValue: `Możesz przypiąć maksymalnie ${limit} formularzy. Odepnij któryś, aby zrobić miejsce.`,
                    })
                );
            }
        },
        [limit, t, togglePin]
    );

    // Accepting or rejecting a form has to refresh the pinned rows too, not just the paginated list.
    const handleRefetch = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["forms", "detail"] });

        return onRefetch?.();
    }, [onRefetch, queryClient]);

    const renderRowContent = (row: TableRow) => {
        switch (row.kind) {
            case "pinned-header":
                return (
                    <PinnedFormsHeader
                        count={count}
                        limit={limit}
                        isCollapsed={isPinnedCollapsed}
                        onToggleCollapse={() => setIsPinnedCollapsed((previous) => !previous)}
                        onUnpinAll={unpinAll}
                    />
                );

            case "pinned-hint":
                return (
                    <div className="text-muted-foreground flex h-full items-center gap-2 text-xs">
                        <Pin className="size-3.5 shrink-0" />
                        <p className="truncate">
                            {t("pinned_forms.empty_hint", {
                                defaultValue:
                                    "Przypnij formularz ikoną pinezki, aby mieć do niego szybki dostęp niezależnie od filtrów.",
                            })}
                        </p>
                    </div>
                );

            case "list-header":
                return (
                    <div className="flex h-full items-center">
                        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                            {t("pinned_forms.all_forms", { defaultValue: "Wszystkie formularze" })}
                        </p>
                    </div>
                );

            case "pinned": {
                if (row.entry.isPending) {
                    return (
                        <div
                            className="bg-card border-border/50 grid items-center gap-2 rounded-lg border p-2.5"
                            style={{ gridTemplateColumns: FORM_ROW_GRID_TEMPLATE_COLUMNS }}
                        >
                            {Array.from({ length: FORM_ROW_COLUMN_COUNT }, (_, columnIndex) => (
                                <Skeleton key={columnIndex} className="h-5 w-full" />
                            ))}
                        </div>
                    );
                }

                if (!row.entry.form) {
                    return (
                        <div className="bg-card border-border/50 text-muted-foreground flex items-center gap-2 rounded-lg border p-2.5 text-xs">
                            <TriangleAlert className="size-3.5 shrink-0" />
                            <p className="truncate">
                                {t("pinned_forms.load_error", {
                                    id: row.entry.id,
                                    defaultValue: "Nie udało się wczytać przypiętego formularza",
                                })}
                            </p>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                className="ml-auto"
                                aria-label={t("pinned_forms.unpin", { defaultValue: "Odepnij" })}
                                title={t("pinned_forms.unpin", { defaultValue: "Odepnij" })}
                                onClick={() => unpin(row.entry.id)}
                            >
                                <PinOff className="size-3.5" />
                            </Button>
                        </div>
                    );
                }

                const pinnedForm = row.entry.form;

                return (
                    <FormRow
                        form={pinnedForm}
                        renderStepAddnotation={renderStepAddnotation}
                        onOpen={() => setSelectedForm(pinnedForm)}
                        isPinned
                        canPin
                        onTogglePin={() => unpin(pinnedForm.id)}
                        showStatus
                    />
                );
            }

            case "form":
                return (
                    <FormRow
                        form={row.form}
                        renderStepAddnotation={renderStepAddnotation}
                        onOpen={() => setSelectedForm(row.form)}
                        isPinned={isPinned(row.form.id)}
                        canPin={!isFull}
                        onTogglePin={() => handleTogglePin(row.form.id)}
                    />
                );

            case "empty":
                return (
                    <div className="text-muted-foreground flex h-full items-center justify-center rounded-lg border border-dashed text-sm">
                        {isSearching
                            ? t("manage_volunteer_forms.no_results")
                            : t("common.no_data", { defaultValue: "No data" })}
                    </div>
                );

            case "loading":
                return (
                    <div
                        className="bg-card border-border/50 grid items-center gap-2 rounded-lg border p-2.5"
                        style={{ gridTemplateColumns: FORM_ROW_GRID_TEMPLATE_COLUMNS }}
                    >
                        {Array.from({ length: FORM_ROW_COLUMN_COUNT }, (_, columnIndex) => (
                            <Skeleton key={columnIndex} className="h-5 w-full" />
                        ))}
                    </div>
                );
        }
    };

    const rowRenderer: ListRowRenderer = ({ index, key, style }) => {
        const row = rows[index];

        if (!row) {
            return null;
        }

        return (
            <div key={key} style={style} className="px-2 py-1">
                {renderRowContent(row)}
            </div>
        );
    };

    return (
        <div className="w-full">
            <div className="border-border/50 overflow-x-auto rounded-xl border">
                <div style={{ minWidth: FORM_ROW_MIN_WIDTH }}>
                    <div className="bg-muted/60 border-border/60 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-20 border-b px-2 py-2 backdrop-blur">
                        {/* The transparent border mirrors the row card's border so columns line up exactly. */}
                        <div
                            className="grid items-center gap-2 border border-transparent px-2.5"
                            style={{ gridTemplateColumns: FORM_ROW_GRID_TEMPLATE_COLUMNS }}
                        >
                            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                                {t("forms_fields.name")}
                            </p>
                            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                                {t("forms_fields.email")}
                            </p>
                            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                                {t("forms_fields.role")}
                            </p>
                            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                                {t("forms_fields.creation_date")}
                            </p>
                            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                                {t("forms_fields.progress")}
                            </p>
                            <div
                                className="text-muted-foreground flex justify-end pr-1"
                                title={t("pinned_forms.title", { defaultValue: "Przypięte formularze" })}
                            >
                                <Pin className="size-3.5" />
                            </div>
                        </div>
                    </div>

                    <InfiniteLoader
                        isRowLoaded={isRowLoaded}
                        loadMoreRows={loadMoreRows}
                        rowCount={rows.length}
                        threshold={4}
                        minimumBatchSize={10}
                    >
                        {({ onRowsRendered, registerChild }) => (
                            <WindowScroller>
                                {({ height, isScrolling, onChildScroll, scrollTop }) => (
                                    <div>
                                        <AutoSizer disableHeight>
                                            {({ width }) => (
                                                <List
                                                    autoHeight
                                                    height={height}
                                                    width={Math.max(width, FORM_ROW_MIN_WIDTH)}
                                                    isScrolling={isScrolling}
                                                    onScroll={onChildScroll}
                                                    onRowsRendered={onRowsRendered}
                                                    rowCount={rows.length}
                                                    rowHeight={({ index }) =>
                                                        ROW_HEIGHT_BY_KIND[rows[index]?.kind ?? "form"]
                                                    }
                                                    rowRenderer={rowRenderer}
                                                    overscanRowCount={5}
                                                    scrollTop={scrollTop}
                                                    ref={(ref) => {
                                                        listRef.current = ref;
                                                        registerChild(ref);
                                                    }}
                                                />
                                            )}
                                        </AutoSizer>
                                    </div>
                                )}
                            </WindowScroller>
                        )}
                    </InfiniteLoader>
                </div>
            </div>

            <RecruitmentManagerModal
                open={Boolean(selectedForm)}
                form={selectedForm}
                onClose={() => setSelectedForm(null)}
                renderStepAddnotation={renderStepAddnotation}
                onRefetch={handleRefetch}
                formNoteKeys={formNoteKeys}
            />

            {total > 0 && <p className="text-muted-foreground mt-3 px-1 text-xs">Total: {total}</p>}
        </div>
    );
};

export default FormsTable;
