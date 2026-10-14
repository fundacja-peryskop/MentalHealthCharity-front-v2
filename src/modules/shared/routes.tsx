import React from "react";
import ChangePasswordCompleteScreen from "../../screens/ChangePasswordCompleteScreen";
import ChangePasswordScreen from "../../screens/ChangePasswordScreen";
import ConfirmEmailCompleteScreen from "../../screens/ConfirmEmailCompleteScreen";
import ConfirmEmailScreen from "../../screens/ConfirmEmailScreen";
import SupportUsScreen from "../../screens/SupportUsScreen";
import { buildChatSupportRegisterUrl } from "../auth/helpers/authRedirect";
import { Roles } from "../users/constants";
import { Permissions } from "./constants";
import { RouteType } from "./types";

const AboutChatScreen = React.lazy(() => import("../../screens/AboutChatScreen"));
const ArticleDashboardScreen = React.lazy(() => import("../../screens/ArticlesDashboardScreen"));
const CreateArticleScreen = React.lazy(() => import("../../screens/CreateArticleScreen"));
const DonationsScreen = React.lazy(() => import("../../screens/DonationsScreen"));
const EditArticleScreen = React.lazy(() => import("../../screens/EditArticleScreen"));
const ForgetPasswordScreen = React.lazy(() => import("../../screens/ForgetPasswordScreen"));
const HowItWorksScreen = React.lazy(() => import("../../screens/HowItWorksScreen"));
const ManageArticlesScreen = React.lazy(() => import("../../screens/ManageArticlesScreen"));
const ManageMenteeFormsScreen = React.lazy(() => import("../../screens/ManageMenteeFormsScreen"));
const MatchingAlertsScreen = React.lazy(() => import("../../screens/MatchingAlertsScreen"));
const MatchingMenteesScreen = React.lazy(() => import("../../screens/MatchingMenteesScreen"));
const MatchingUserHistoryScreen = React.lazy(() => import("../../screens/MatchingUserHistoryScreen"));
const MatchingVolunteersScreen = React.lazy(() => import("../../screens/MatchingVolunteersScreen"));
const ManageVolunteerFormsScreen = React.lazy(() => import("../../screens/ManageVolunteerFormsScreen"));
const MenteeFormScreen = React.lazy(() => import("../../screens/MenteeFormScreen"));
const NotFoundScreen = React.lazy(() => import("../../screens/NotFoundScreen"));
const RegisterScreen = React.lazy(() => import("../../screens/RegisterScreen"));
const TosScreen = React.lazy(() => import("../../screens/TosScreen"));
const VolunteerAvailabilityScreen = React.lazy(() => import("../../screens/VolunteerAvailabilityScreen"));
const VolunteerFormScreen = React.lazy(() => import("../../screens/VolunteerFormScreen"));
const ManageChatsScreen = React.lazy(() => import("../../screens/ManageChatsScreen"));
const AdminScreen = React.lazy(() => import("../../screens/AdminScreen"));
const AdminSettingsScreen = React.lazy(() => import("../../screens/AdminSettingsScreen"));
const ArticleScreen = React.lazy(() => import("../../screens/ArticleScreen"));
const ArticlesScreen = React.lazy(() => import("../../screens/ArticlesScreen"));
const ChatScreen = React.lazy(() => import("../../screens/ChatScreen"));
const HomepageScreen = React.lazy(() => import("../../screens/HomepageScreen"));
const LoginScreen = React.lazy(() => import("../../screens/LoginScreen"));
const ProfileScreen = React.lazy(() => import("../../screens/ProfileScreen"));
const ReportsScreen = React.lazy(() => import("../../screens/ReportsScreen"));
const TrainingsScreen = React.lazy(() => import("../../screens/TrainingsScreen"));
const UserEditorScreen = React.lazy(() => import("../../screens/UserEditorScreen"));
const MenteeFormGettingStartedScreen = React.lazy(() => import("../../screens/MenteeFormGettingStartedScreen"));
const LeavingScreen = React.lazy(() => import("../../screens/LeavingScreen"));

const routes: RouteType[] = [
    {
        url: "/",
        onRender: <HomepageScreen />,
        requiresAuth: false,
    },
    {
        url: "/form/mentee",
        onRender: <MenteeFormScreen />,
        requiresAuth: true,
        unauthenticatedRedirect: buildChatSupportRegisterUrl("/form/mentee"),
    },
    {
        url: "/form/mentee-getting-started",
        onRender: <MenteeFormGettingStartedScreen />,
        requiresAuth: false,
    },
    {
        url: "/about-chat",
        onRender: <AboutChatScreen />,
        requiresAuth: false,
    },
    {
        url: "/how-it-works",
        onRender: <HowItWorksScreen />,
        requiresAuth: false,
    },
    {
        url: "/leaving",
        onRender: <LeavingScreen />,
        requiresAuth: false,
    },
    {
        url: "/form/volunteer",
        onRender: <VolunteerFormScreen />,
        requiresAuth: true,
    },
    {
        url: "/auth/forget-password-classic",
        onRender: <ForgetPasswordScreen />,
        requiresAuth: false,
    },
    {
        url: "/reset-password",
        onRender: <ChangePasswordCompleteScreen />,
        requiresAuth: false,
    },
    {
        url: "/auth/forget-password",
        onRender: <ChangePasswordScreen />,
        requiresAuth: false,
    },
    {
        url: "/login",
        onRender: <LoginScreen />,
        requiresAuth: false,
    },
    {
        url: "/auth/register",
        onRender: <RegisterScreen />,
        requiresAuth: false,
    },
    {
        url: "/tos",
        onRender: <TosScreen />,
        requiresAuth: false,
    },
    {
        url: "/register",
        onRender: <div>Register</div>,
        requiresAuth: false,
    },
    {
        url: "/auth/confirm-email-begin",
        onRender: <ConfirmEmailScreen />,
        requiresAuth: false,
    },
    {
        url: "/confirm",
        onRender: <ConfirmEmailCompleteScreen />,
        requiresAuth: false,
    },
    {
        url: "/support",
        onRender: <SupportUsScreen />,
        requiresAuth: false,
    },
    {
        url: "/donations",
        onRender: <DonationsScreen />,
        requiresAuth: false,
    },
    {
        url: "/admin",
        onRender: <AdminScreen />,
        requiresAuth: true,
        permission: Permissions.ADMIN_DASHBOARD,
    },
    {
        url: "/admin/reports",
        onRender: <ReportsScreen />,
        requiresAuth: true,
        permission: Permissions.MANAGE_REPORTS,
    },
    {
        url: "/admin/users",
        onRender: <UserEditorScreen />,
        requiresAuth: true,
        permission: Permissions.MANAGE_USERS,
    },
    {
        url: "/admin/settings",
        onRender: <AdminSettingsScreen />,
        requiresAuth: true,
        permission: Permissions.MANAGE_USERS,
        roles: [Roles.ADMIN],
    },
    {
        url: "/admin/articles",
        onRender: <ManageArticlesScreen />,
        requiresAuth: true,
        permission: Permissions.MANAGE_ARTICLES,
    },
    {
        url: "/admin/forms/mentee",
        onRender: <ManageMenteeFormsScreen />,
        requiresAuth: true,
        permission: Permissions.MANAGE_MENTEE_FORMS,
    },
    {
        url: "/admin/matching/mentees",
        onRender: <MatchingMenteesScreen />,
        requiresAuth: true,
        permission: Permissions.MANAGE_CHATS,
    },
    {
        url: "/admin/matching/volunteers",
        onRender: <MatchingVolunteersScreen />,
        requiresAuth: true,
        permission: Permissions.MANAGE_CHATS,
    },
    {
        url: "/admin/matching/alerts",
        onRender: <MatchingAlertsScreen />,
        requiresAuth: true,
        permission: Permissions.MANAGE_CHATS,
    },
    {
        url: "/admin/matching/history",
        onRender: <MatchingUserHistoryScreen />,
        requiresAuth: true,
        permission: Permissions.MANAGE_CHATS,
    },
    {
        url: "/admin/forms/volunteer",
        onRender: <ManageVolunteerFormsScreen />,
        requiresAuth: true,
        permission: Permissions.MANAGE_VOLUNTEER_FORMS,
    },
    {
        url: "/admin/chats",
        onRender: <ManageChatsScreen />,
        requiresAuth: true,
        permission: Permissions.MANAGE_CHATS,
    },
    {
        url: "/profile/:userId",
        onRender: <ProfileScreen />,
        requiresAuth: true,
    },
    {
        url: "/articles",
        onRender: <ArticlesScreen />,
        requiresAuth: false,
    },
    {
        url: "/trainings",
        onRender: <TrainingsScreen />,
        requiresAuth: true,
        permission: Permissions.VIEW_TRAININGS,
        roles: [Roles.VOLUNTEER, Roles.REDACTOR, Roles.ADMIN, Roles.VOLUNTEERSUPERVISOR],
    },
    {
        url: "/articles/create",
        onRender: <CreateArticleScreen />,
        requiresAuth: true,
        permission: Permissions.CREATE_ARTICLE,
    },
    {
        url: "/articles/edit/:id",
        onRender: <EditArticleScreen />,
        requiresAuth: true,
        permission: Permissions.CREATE_ARTICLE,
    },
    {
        url: "/articles/dashboard",
        onRender: <ArticleDashboardScreen />,
        requiresAuth: true,
        permission: Permissions.CREATE_ARTICLE,
    },
    {
        url: "/article/:id",
        onRender: <ArticleScreen />,
        requiresAuth: false,
    },
    {
        url: "/chat/:id",
        onRender: <ChatScreen />,
        requiresAuth: true,
        permission: Permissions.READ_OWN_CHATS,
    },
    {
        url: "/chat",
        onRender: <ChatScreen />,
        requiresAuth: true,
        permission: Permissions.READ_OWN_CHATS,
    },
    {
        url: "/volunteer/availability",
        onRender: <VolunteerAvailabilityScreen />,
        requiresAuth: true,
        permission: Permissions.MANAGE_OWN_AVAILABILITY,
        roles: [Roles.VOLUNTEER],
    },

    {
        url: "/users",
        onRender: <div>Users</div>,
        requiresAuth: true,
        permission: Permissions.MANAGE_USERS,
    },
    {
        url: "/users/:id",
        onRender: <div>User</div>,
        requiresAuth: true,
    },
    {
        url: "/404",
        onRender: <NotFoundScreen />,
        requiresAuth: false,
    },
    {
        url: "*",
        onRender: <NotFoundScreen />,
        requiresAuth: false,
    },
];

export default routes;
