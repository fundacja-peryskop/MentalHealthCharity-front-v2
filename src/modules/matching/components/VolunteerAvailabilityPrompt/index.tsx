import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useUser } from "../../../auth/components/AuthProvider";
import { Roles } from "../../../users/constants";
import Modal from "../../../shared/components/Modal";
import {
    AVAILABILITY_CAPACITY_OPTIONS,
    AVAILABILITY_QUESTION,
    AVAILABILITY_WEEKLY_TIME_HINT,
    DEFAULT_AVAILABILITY_CAPACITY,
    FIRST_TIME_AVAILABILITY_MESSAGE,
    FIRST_TIME_ZERO_AVAILABILITY_MESSAGE,
    LOW_AVAILABILITY_WARNING,
    MAX_AVAILABILITY_CAPACITY,
    MIN_AVAILABILITY_CAPACITY,
} from "../../constants";
import updateVolunteerAvailabilityMutation from "../../queries/updateVolunteerAvailabilityMutation";
import { volunteerAvailabilityQueryOptions } from "../../queries/volunteerAvailabilityQueryOptions";

const VolunteerAvailabilityPrompt = () => {
    const { t } = useTranslation();
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [capacity, setCapacity] = useState(String(DEFAULT_AVAILABILITY_CAPACITY));
    const [showFirstTimeConfirmation, setShowFirstTimeConfirmation] = useState(false);
    const [firstTimeDeclaredCapacity, setFirstTimeDeclaredCapacity] = useState<number | null>(null);
    const firstTimeConfirmationRef = useRef(false);
    const isVolunteer = user?.user_role === Roles.VOLUNTEER;

    const { data, isFetching } = useQuery(
        volunteerAvailabilityQueryOptions({
            enabled: isVolunteer,
            retry: false,
            refetchOnWindowFocus: true,
        })
    );

    const { mutate, isPending } = useMutation({
        mutationFn: updateVolunteerAvailabilityMutation,
        onSuccess: (updatedAvailability) => {
            setCapacity(String(updatedAvailability.declared_capacity ?? DEFAULT_AVAILABILITY_CAPACITY));

            if (updatedAvailability.first_time_declaration) {
                firstTimeConfirmationRef.current = true;
                setFirstTimeDeclaredCapacity(updatedAvailability.declared_capacity);
                setShowFirstTimeConfirmation(true);
                setOpen(true);
            } else {
                firstTimeConfirmationRef.current = false;
                setOpen(false);
                toast.success(t("matching.availability_saved", { defaultValue: "Dyspozycyjność została zapisana" }));
            }

            queryClient.setQueryData(["volunteerAvailability"], updatedAvailability);
        },
    });

    useEffect(() => {
        if (!isVolunteer || !data) return;

        setCapacity(String(data.declared_capacity ?? DEFAULT_AVAILABILITY_CAPACITY));

        if (!firstTimeConfirmationRef.current && !showFirstTimeConfirmation) {
            setOpen(data.must_prompt);
        }
    }, [data, isVolunteer, showFirstTimeConfirmation]);

    if (!isVolunteer) return null;

    const parsedCapacity = Number(capacity);
    const isValidCapacity =
        Number.isInteger(parsedCapacity) &&
        parsedCapacity >= MIN_AVAILABILITY_CAPACITY &&
        parsedCapacity <= MAX_AVAILABILITY_CAPACITY;
    const selectedBelowCurrentAssignments = data ? parsedCapacity < data.active_chat_count : false;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isValidCapacity || isPending) return;

        mutate({ declared_capacity: parsedCapacity });
    };

    const closeFirstTimeConfirmation = () => {
        firstTimeConfirmationRef.current = false;
        setFirstTimeDeclaredCapacity(null);
        setShowFirstTimeConfirmation(false);
        setOpen(false);
    };

    return (
        <Modal
            open={open}
            onClose={() => {
                if (showFirstTimeConfirmation) {
                    closeFirstTimeConfirmation();
                    return;
                }

                if (!data?.must_prompt) {
                    setOpen(false);
                }
            }}
            title={t("matching.availability_title", { defaultValue: "Twoja dyspozycyjność" })}
            hideCloseButton={data?.must_prompt || showFirstTimeConfirmation}
        >
            {showFirstTimeConfirmation ? (
                <div className="flex flex-col gap-4">
                    <p className="text-muted-foreground text-sm">
                        {firstTimeDeclaredCapacity === 0
                            ? t("matching.availability_first_time_zero_message", {
                                  defaultValue: FIRST_TIME_ZERO_AVAILABILITY_MESSAGE,
                              })
                            : t("matching.availability_first_time_message", {
                                  defaultValue: FIRST_TIME_AVAILABILITY_MESSAGE,
                              })}
                    </p>
                    <Button className="ml-auto" type="button" onClick={closeFirstTimeConfirmation}>
                        {t("common.close", { defaultValue: "Zamknij" })}
                    </Button>
                </div>
            ) : (
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <p className="text-muted-foreground text-sm">
                        {t("matching.availability_description", {
                            defaultValue: AVAILABILITY_QUESTION,
                        })}
                    </p>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="volunteer-availability">
                            {t("matching.availability_capacity", { defaultValue: "Liczba osób" })}
                        </Label>
                        <Select
                            value={capacity}
                            onValueChange={(value) => {
                                if (value) setCapacity(value);
                            }}
                            disabled={isPending}
                        >
                            <SelectTrigger id="volunteer-availability" className="h-10 w-full bg-transparent">
                                <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                                {AVAILABILITY_CAPACITY_OPTIONS.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {!isValidCapacity && (
                            <p className="text-destructive text-sm">
                                {t("matching.availability_validation", {
                                    defaultValue: "Wpisz liczbę od 0 do 10.",
                                })}
                            </p>
                        )}
                    </div>

                    <p className="text-muted-foreground text-sm">
                        {t("matching.availability_weekly_time_hint", {
                            defaultValue: AVAILABILITY_WEEKLY_TIME_HINT,
                        })}
                    </p>

                    {(data?.below_current_assignments || selectedBelowCurrentAssignments) && (
                        <p className="text-destructive text-sm whitespace-pre-line">
                            {t("matching.availability_below_assignments_warning", {
                                defaultValue: LOW_AVAILABILITY_WARNING,
                            })}
                        </p>
                    )}

                    <div className="flex items-center justify-between gap-3">
                        {isFetching && <Loader2 className="text-muted-foreground size-4 animate-spin" />}
                        <Button className="ml-auto" type="submit" disabled={!isValidCapacity || isPending}>
                            {isPending && <Loader2 className="size-4 animate-spin" />}
                            {t("common.save")}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default VolunteerAvailabilityPrompt;
