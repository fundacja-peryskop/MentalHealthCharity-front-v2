import { Section, Stack, YStack } from "@fundacja-peryskop/ui";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { PageContainer } from "../modules/layout/PageContainer";
import { ArticleStatus } from "../modules/articles/constants";
import { articlesByUserQueryOptions } from "../modules/articles/queries/articlesByUserQueryOptions";
import { useUser } from "../modules/auth/components/AuthProvider";
import Loader from "../modules/shared/components/Loader";
import resolveAssetUrl from "../modules/shared/helpers/resolveAssetUrl";
import UserProfileHeading from "../modules/users/components/Profile";
import UserProfileArticles from "../modules/users/components/UserProfileArticles";
import UserProfileDescription from "../modules/users/components/UserProfileDescription";
import UserProfileSettings from "../modules/users/components/UserProfileSettings";
import { Roles } from "../modules/users/constants";
import { editPublicProfileMutation } from "../modules/users/queries/editPublicProfileMutation";
import { readPublicProfileQueryOptions } from "../modules/users/queries/readPublicProfileQueryOptions";
import updateAvatarMutation from "../modules/users/queries/updateAvatarMutation";

const ProfileScreen = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const { t } = useTranslation();

    const shouldFetchProfile = Number(userId) !== user?.id || user?.user_role !== Roles.USER;

    const {
        data,
        isLoading,
        isSuccess,
        refetch: refreshProfile,
    } = useQuery(
        readPublicProfileQueryOptions(
            { id: Number(userId) || -1 },
            {
                enabled: !!userId && shouldFetchProfile,
            }
        )
    );

    const { mutate: updateProfile } = useMutation({
        mutationFn: editPublicProfileMutation,
        onSuccess() {
            toast.success(t("profile.profile_updated"));
            refreshProfile();
        },
    });

    const { mutate: updateAvatar } = useMutation({
        mutationFn: updateAvatarMutation,
        onSuccess() {
            toast.success(t("profile.profile_updated"));
            refreshProfile();
        },
        onError(error) {
            toast.error(t(error.message));
        },
    });

    const isOwner = !!user && user.id === Number(userId);
    const isPublicProfile = isSuccess;

    const { data: articles } = useQuery(
        articlesByUserQueryOptions(
            {
                status: ArticleStatus.SENT,
                author: Number(userId) || -1,
                page: 1,
                size: 24,
            },
            {
                enabled: isPublicProfile,
                queryKey: [
                    "articlesByUser",
                    {
                        status: ArticleStatus.SENT,
                        author: Number(userId) || -1,
                    },
                ],
            }
        )
    );

    if (!userId || (!data && !isOwner)) {
        navigate("/404");
        return null;
    }

    if (isLoading) {
        return <Loader variant="fullscreen" />;
    }

    const role = isPublicProfile ? data.user.user_role : (user?.user_role ?? null);
    const username = isPublicProfile ? data.user.full_name : (user?.full_name ?? null);
    const avatar = data ? resolveAssetUrl(data.avatar_url) : undefined;

    return (
        <YStack width="100%">
            {/* Subtle brand band */}
            <Stack width="100%" height={200} backgroundColor="$primarySoft" />

            {/* Content pulled up over the band */}
            <Section alignItems="center" paddingBottom="$xxxl">
                <PageContainer maxWidth={800} marginTop={-120} gap="$lg">
                    {username && role && (
                        <UserProfileHeading
                            onSubmit={({ avatar }) => updateAvatar({ id: Number(userId), avatar })}
                            isOwner={isOwner}
                            username={username}
                            role={role}
                            avatar_url={avatar}
                        />
                    )}
                    {isOwner && user && <UserProfileSettings email={user.email} username={user.full_name} />}
                    {isPublicProfile && data && (
                        <UserProfileDescription
                            onSubmit={(val) => updateProfile({ ...val, id: data.user.id, avatar_url: data.avatar_url })}
                            isOwner={isOwner}
                            content={data.description}
                        />
                    )}
                    {articles && <UserProfileArticles articles={articles.items} />}
                </PageContainer>
            </Section>
        </YStack>
    );
};

export default ProfileScreen;
