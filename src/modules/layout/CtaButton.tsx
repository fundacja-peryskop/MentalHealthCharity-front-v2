import { Button, type ButtonProps } from "@fundacja-peryskop/ui";
import { useNavigate } from "react-router-dom";

export interface CtaButtonProps extends ButtonProps {
    href: string;
    external?: boolean;
}

/**
 * Pill-shaped design-system `Button` that navigates on press: internal hrefs go
 * through React Router (SPA), while external / tel / mailto targets open
 * directly. Defaults to the `$full` pill radius the reference uses for CTAs.
 */
export function CtaButton({ href, external, borderRadius = "$full", ...buttonProps }: CtaButtonProps) {
    const navigate = useNavigate();

    const handlePress = () => {
        if (external || /^(tel:|mailto:|https?:\/\/)/.test(href)) {
            if (/^https?:\/\//.test(href)) {
                window.open(href, "_blank", "noopener,noreferrer");
            } else {
                window.location.href = href;
            }
            return;
        }
        navigate(href);
    };

    return <Button borderRadius={borderRadius} onPress={handlePress} {...buttonProps} />;
}
