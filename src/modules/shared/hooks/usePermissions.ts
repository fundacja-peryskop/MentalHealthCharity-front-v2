import { useCallback } from "react";
import { useUser } from "../../auth/components/AuthProvider";
import { Permissions, roleHasPermission } from "../constants";

const usePermissions = () => {
    const { user } = useUser();

    const hasPermissions = useCallback(
        (permission: Permissions) => !!user && roleHasPermission(user.user_role, permission),
        [user]
    );

    return { hasPermissions };
};

export default usePermissions;
