import { Typography } from "@fundacja-peryskop/ui";
import { useTranslation } from "react-i18next";
import { AppLink } from "../../../layout/AppLink";
import { FormCheckboxField } from "../../../layout/form/FormCheckboxField";

/**
 * Terms-of-service consent checkbox, shared by every form. Wraps the Formik
 * `FormCheckboxField` with the standard consent label and a link to the terms.
 */
export function ConsentField({ name }: { name: string }) {
    const { t } = useTranslation();

    return (
        <FormCheckboxField
            name={name}
            size="sm"
            label={
                <Typography variant="smallRegular">
                    {t("crisis.tos_label", { defaultValue: "Wyrażam zgodę na" })}{" "}
                    <AppLink href="/tos" external variant="smallSemibold" color="$primary">
                        {t("crisis.tos_link", { defaultValue: "warunki użytkowania i politykę prywatności" })}
                    </AppLink>
                </Typography>
            }
        />
    );
}
