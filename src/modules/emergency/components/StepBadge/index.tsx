import { Stack, Typography } from "@fundacja-peryskop/ui";

interface Props {
    number: number;
}

const StepBadge = ({ number }: Props) => (
    <Stack
        width={32}
        height={32}
        flexShrink={0}
        borderRadius="$full"
        alignItems="center"
        justifyContent="center"
        backgroundColor="$dangerSoft"
        aria-hidden
    >
        <Typography variant="smallSemibold" color="$dangerTextSoft">
            {number}
        </Typography>
    </Stack>
);

export default StepBadge;
