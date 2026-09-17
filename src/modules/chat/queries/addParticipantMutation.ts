import { url } from "../../../api";
import getAuthHeaders from "../../auth/helpers/getAuthHeaders";
import handleApiError from "../../shared/helpers/handleApiError";
import { ParticipantOptions } from "../types";

const addParticipantMutation = async ({ chat_id, participant_id }: ParticipantOptions) => {
    const headers = getAuthHeaders();

    try {
        const res = await fetch(url.chat.addParticipant({ chat_id, participant_id }), {
            method: "POST",
            headers,
        });

        if (!res.ok) {
            throw await handleApiError(await res.json());
        }

        return await res.json();
    } catch (e) {
        console.error("Error while adding participant:", e);
        throw e;
    }
};

export default addParticipantMutation;
