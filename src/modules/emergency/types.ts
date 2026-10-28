import type { Roles } from "../users/constants";

export interface SupportContact {
    name: string;
    phone: string;
    user_role: Roles;
}
