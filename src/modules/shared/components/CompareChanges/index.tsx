import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslation } from "react-i18next";

interface DataSet {
    [key: string]: string | number | boolean | null;
}

interface Props {
    dataA: DataSet;
    dataB: DataSet;
}

const DataComparison = ({ dataA, dataB }: Props) => {
    const { t } = useTranslation();

    const differences = Object.keys(dataA).reduce(
        (acc, key) => {
            if (dataA[key] !== dataB[key]) {
                acc[key] = {
                    oldValue: dataA[key],
                    newValue: dataB[key],
                };
            }
            return acc;
        },
        {} as Record<string, { oldValue: unknown; newValue: unknown }>
    );

    if (Object.keys(differences).length === 0) {
        return <p className="text-foreground">{t("common.compare_changes.no_changes")}</p>;
    }

    return (
        <div className="bg-card rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-foreground">{t("common.compare_changes.field")}</TableHead>
                        <TableHead className="text-foreground">{t("common.compare_changes.old_value")}</TableHead>
                        <TableHead className="text-foreground">{t("common.compare_changes.new_value")}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.entries(differences).map(([field, { oldValue, newValue }]) => (
                        <TableRow key={field}>
                            <TableCell className="text-foreground">{field}</TableCell>
                            <TableCell className="text-red-600">{String(oldValue) || "-"}</TableCell>
                            <TableCell className="text-green-600">{String(newValue) || "-"}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default DataComparison;
