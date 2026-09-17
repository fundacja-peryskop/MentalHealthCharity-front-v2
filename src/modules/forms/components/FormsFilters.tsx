import { Button } from "@/components/ui/button";
import { Filter, Search, X } from "lucide-react";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { translatedFormStatus, translateFormSorting } from "../constants";
import { formSorting, formStatus } from "../types";

interface Props {
    search: string;
    onSearchChange: (value: string) => void;
    status: formStatus;
    onStatusChange: (value: formStatus) => void;
    sort: formSorting;
    onSortChange: (value: formSorting) => void;
}

const FormsFilters = ({ search, onSearchChange, status, onStatusChange, sort, onSortChange }: Props) => {
    const { t } = useTranslation();
    const searchId = useId();

    return (
        <div className="mt-5 mb-4 flex w-full flex-wrap items-end gap-3">
            <div className="min-w-0 flex-[1_1_320px]">
                <label htmlFor={searchId} className="mb-2 block text-sm font-medium">
                    {t("forms_search.search_label")}
                </label>
                <div className="relative max-w-xl">
                    <Search aria-hidden="true" className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                    <input
                        id={searchId}
                        type="search"
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        maxLength={200}
                        placeholder={t("forms_search.search_placeholder")}
                        className="border-input focus-visible:ring-ring/50 h-9 w-full rounded-lg border bg-transparent pr-10 pl-9 text-sm outline-none focus-visible:ring-3"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => onSearchChange("")}
                            aria-label={t("forms_search.clear_search")}
                            className="text-muted-foreground absolute top-2 right-2 rounded p-0.5"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-3">
                {Object.keys(formStatus).map((option) => (
                    <Button
                        key={option}
                        className="whitespace-nowrap text-white"
                        style={{ opacity: option === status ? 1 : 0.5 }}
                        onClick={() => onStatusChange(option as formStatus)}
                    >
                        <Filter className="size-4" />
                        {translatedFormStatus[option as formStatus]}
                    </Button>
                ))}
                <select
                    value={sort}
                    onChange={(e) => onSortChange(e.target.value as formSorting)}
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 min-w-[180px] rounded-lg border bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:ring-3 max-sm:w-full"
                >
                    {Object.values(formSorting).map((option) => (
                        <option key={option} value={option}>
                            {translateFormSorting[option]}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default FormsFilters;
