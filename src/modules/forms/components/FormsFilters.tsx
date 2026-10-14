import { Input, Select, XStack, YStack } from "@fundacja-peryskop/ui";
import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { FilterPills } from "../../layout/admin";
import { useIconColor } from "../../layout/useIconColor";
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

/**
 * Shared filter bar for the mentee and volunteer form lists: a free-text search
 * (name, e-mail, phone or form content), status pills and a sort select. The
 * parent owns the state and debounces the search before querying.
 */
const FormsFilters = ({ search, onSearchChange, status, onStatusChange, sort, onSortChange }: Props) => {
    const { t } = useTranslation();
    const icon = useIconColor();

    return (
        <YStack width="100%" gap="$md">
            <YStack width="100%" maxWidth={560}>
                <Input
                    label={t("forms_search.search_label")}
                    value={search}
                    onChangeText={onSearchChange}
                    placeholder={t("forms_search.search_placeholder")}
                    maxLength={200}
                    prefix={<Search size={18} color={icon.muted} aria-hidden />}
                    suffix={
                        search ? (
                            <button
                                type="button"
                                onClick={() => onSearchChange("")}
                                aria-label={t("forms_search.clear_search")}
                                style={{ display: "inline-flex", cursor: "pointer", background: "none", border: 0 }}
                            >
                                <X size={16} color={icon.muted} />
                            </button>
                        ) : undefined
                    }
                />
            </YStack>

            <XStack flexWrap="wrap" alignItems="flex-end" gap="$md">
                <FilterPills
                    ariaLabel={t("common.status", { defaultValue: "Status" })}
                    value={status}
                    onChange={(value) => onStatusChange(value as formStatus)}
                    options={Object.keys(formStatus).map((option) => ({
                        value: option,
                        label: translatedFormStatus[option as formStatus],
                    }))}
                />
                <YStack width={220}>
                    <Select
                        value={sort}
                        onValueChange={(value) => onSortChange(value as formSorting)}
                        options={Object.values(formSorting).map((option) => ({
                            value: option,
                            label: translateFormSorting[option],
                        }))}
                    />
                </YStack>
            </XStack>
        </YStack>
    );
};

export default FormsFilters;
