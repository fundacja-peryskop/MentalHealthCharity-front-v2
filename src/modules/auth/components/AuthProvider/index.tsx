import { useMutation, UseMutationResult, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import Cookies from "js-cookie";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import Loader from "../../../shared/components/Loader";
import handleApiError from "../../../shared/helpers/handleApiError";
import { clearAuthSession, isAuthSessionError, redirectToLogin } from "../../helpers/session";
import fetchUserData from "../../queries/fetchUserDataQuery";
import { registerMutation } from "../../queries/registerMutation";
import { loginMutation } from "../../queries/tokenMutation";
import { LoginAccessTokenResponse, LoginFormValues, RegisterPayload, RegisterResponse, User } from "../../types";

interface UserContextType {
    user: User | undefined;
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
    const queryClient = useQueryClient();

    const endSession = useCallback(
        (redirect = false) => {
            clearAuthSession();
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

    const logout = () => {
        endSession();
        window.location.assign("/login");
    };

    return (
        <UserContext.Provider value={{ user, login, isLoading, error, logout, register, isFetchingUser: isFetching }}>
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
