import { useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import Cookies from "js-cookie";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Loader from "../../../shared/components/Loader";
import handleApiError from "../../../shared/helpers/handleApiError";
import {
    applyRolePreview,
    canPreviewRoles,
    clearStoredRolePreview,
    isPreviewableRole,
    readStoredRolePreview,
    writeStoredRolePreview,
} from "../../../role-preview/rolePreview";
import { Roles } from "../../../users/constants";
import { clearAuthSession, isAuthSessionError, redirectToLogin } from "../../helpers/session";
import fetchUserData from "../../queries/fetchUserDataQuery";
import { registerMutation } from "../../queries/registerMutation";
import { loginMutation } from "../../queries/tokenMutation";
import { LoginAccessTokenResponse, LoginFormValues, RegisterPayload, RegisterResponse, User } from "../../types";

interface UserContextType {
    /**
     * The signed-in user as the UI should treat them. During an administrator's
     * role preview `user_role` is the previewed role; use `actualUser` where
     * the real role matters (e.g. anything that writes data).
     */
    user: User | undefined;
    /** The signed-in user exactly as the server returned them. */
    actualUser: User | undefined;
    /** Role an administrator is currently previewing, or null. */
    previewRole: Roles | null;
    /** Start (a role) or end (null) the role preview. No-op for non-administrators. */
    setPreviewRole: (role: Roles | null) => void;
    login: UseMutationResult<LoginAccessTokenResponse, Error, LoginFormValues>;
    isLoading: boolean;
    error: Error | null;
    register: UseMutationResult<RegisterResponse, Error, RegisterPayload>;
    logout: () => void;
    isFetchingUser: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface Props {
    children: ReactNode;
}

export const UserProvider: React.FC<Props> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!Cookies.get("token"));
    // Requested preview role; it only takes effect for an administrator (see `previewRole` below).
    const [requestedPreview, setRequestedPreview] = useState<{ userId: number; role: Roles } | null>(null);
    const queryClient = useQueryClient();

    const endSession = useCallback(
        (redirect = false) => {
            clearAuthSession();
            clearStoredRolePreview();
            setRequestedPreview(null);
            setIsAuthenticated(false);
            queryClient.clear();

            if (redirect) {
                redirectToLogin();
            }
        },
        [queryClient]
    );

    const register = useMutation({
        mutationFn: registerMutation,
    });

    const login = useMutation({
        mutationFn: loginMutation,
        onSuccess: (data) => {
            Cookies.set("token", data.access_token, { expires: 7 });
            Cookies.set("jwt_type", data.token_type, { expires: 7 });
            setIsAuthenticated(true);

            refetch();
        },
        onError: (error) => {
            handleApiError(error);
            endSession();
        },
    });

    const {
        data: user,
        refetch,
        isLoading,
        isFetching,
        error,
    }: UseQueryResult<User, Error> = useQuery({
        queryKey: ["userData"],
        queryFn: fetchUserData,
        enabled: isAuthenticated,
        retry: false,
    });

    useEffect(() => {
        if (isAuthSessionError(error)) {
            endSession(true);
        }
    }, [endSession, error]);

    // Restore this tab's preview once the user is known (survives reloads).
    useEffect(() => {
        if (!user || !canPreviewRoles(user)) return;
        const stored = readStoredRolePreview(user.id);
        setRequestedPreview(stored ? { userId: user.id, role: stored } : null);
    }, [user]);

    const previewRole =
        user && canPreviewRoles(user) && requestedPreview?.userId === user.id ? requestedPreview.role : null;
    const effectiveUser = useMemo(() => applyRolePreview(user, previewRole), [user, previewRole]);

    const setPreviewRole = useCallback(
        (role: Roles | null) => {
            if (!user || !canPreviewRoles(user)) return;
            const next = role && isPreviewableRole(role) ? role : null;
            writeStoredRolePreview(user.id, next);
            setRequestedPreview(next ? { userId: user.id, role: next } : null);
        },
        [user]
    );

    const logout = () => {
        endSession();
        window.location.assign("/login");
    };

    return (
        <UserContext.Provider
            value={{
                user: effectiveUser,
                actualUser: user,
                previewRole,
                setPreviewRole,
                login,
                isLoading,
                error,
                logout,
                register,
                isFetchingUser: isFetching,
            }}
        >
            {children}
            {isLoading && <Loader text="Trwa logowanie..." variant="fullscreen" />}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
