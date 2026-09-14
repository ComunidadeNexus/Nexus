import React, { useState } from "react";
import { Camera, Plus, SlidersHorizontal, MessageCircle, Loader2 } from "lucide-react";
import CreatePostModal from "@/components/community/CreatePostModal";
import ReportProfileModal from "@/components/profile/ReportProfileModal";
import FollowButton from "@/components/profile/FollowButton";
import SocialLinksRow from "@/components/profile/SocialLinksRow";
import { ProfileName, UserAvatar } from "@/components/profile/ProfileLink";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  chosenCategoryLabels,
  formatFollowersLabel,
  formatFollowingLabel,
  type ProfileCategoryKey,
  type SocialLinks,
} from "@/lib/profileSocial";

interface ProfileMainHeaderProps {
  profile: {
    user_id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
    bio: string | null;
    is_verified?: boolean;
    profile_categories?: ProfileCategoryKey[];
    social_links?: SocialLinks;
  };
  isOwnProfile?: boolean;
  onEditClick?: () => void;
  followersCount?: number;
  followingCount?: number;
  onOpenFollowList?: (tab: "followers" | "following") => void;
}

const ProfileMainHeader = ({
  profile,
  isOwnProfile,
  onEditClick,
  followersCount = 0,
  followingCount = 0,
  onOpenFollowList,
}: ProfileMainHeaderProps) => {
  const displayName = profile.name || profile.username || "Usuário";
  const handle = profile.username ? `u/${profile.username}` : "u/usuario";
  const categories = chosenCategoryLabels(profile.profile_categories);

  const { startConversation } = useDirectMessages({ realtime: false });
  const navigate = useNavigate();
  const [isStartingChat, setIsStartingChat] = useState(false);

  const handleMessageClick = async () => {
    if (!profile.user_id) return;
    setIsStartingChat(true);
    const { error, conversationId } = await startConversation(profile.user_id);
    setIsStartingChat(false);

    if (error) {
      toast.error("Não foi possível iniciar a conversa.");
    } else if (conversationId) {
      navigate(`/mensagens/${conversationId}`);
    }
  };

  return (
    <div className="mb-4 pt-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 px-1 min-w-0">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="relative">
            <UserAvatar
              userId={profile.user_id}
              name={displayName}
              avatarUrl={profile.avatar_url}
              link={false}
              className="w-16 h-16 bg-white dark:bg-[#1A282D] border-2 border-primary/20"
              fallbackClassName="text-xl bg-primary/10 text-primary"
            />
            {isOwnProfile && onEditClick && (
              <button
                type="button"
                onClick={onEditClick}
                className="absolute bottom-0 right-0 bg-primary p-1.5 rounded-full text-white hover:bg-primary/80 transition-colors border-2 border-white dark:border-[#0B1416]"
                aria-label="Editar foto de perfil"
              >
                <Camera className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold gradient-text">
              <ProfileName
                userId={profile.user_id}
                name={displayName}
                isVerified={profile.is_verified}
                link={false}
                className="font-bold"
                badgeClassName="w-5 h-5"
              />
            </h1>
            <p className="text-sm text-gray-500 font-medium">{handle}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mt-1">
              <button
                type="button"
                className="min-h-11 text-gray-900 dark:text-white font-medium hover:underline"
                onClick={() => onOpenFollowList?.("followers")}
              >
                {formatFollowersLabel(followersCount)}
              </button>
              <button
                type="button"
                className="min-h-11 text-gray-900 dark:text-white font-medium hover:underline"
                onClick={() => onOpenFollowList?.("following")}
              >
                {formatFollowingLabel(followingCount)}
              </button>
            </div>
            {profile.bio && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 max-w-md">
                {profile.bio}
              </p>
            )}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {categories.map((category) => (
                  <span
                    key={category.key}
                    className="inline-flex items-center min-h-8 px-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary"
                  >
                    {category.label}
                  </span>
                ))}
              </div>
            )}
            <SocialLinksRow
              socialLinks={profile.social_links}
              className="flex flex-wrap gap-2 mt-3"
              emptyState={
                isOwnProfile && onEditClick ? (
                  <button
                    type="button"
                    onClick={onEditClick}
                    className="mt-3 min-h-11 px-3 rounded-full text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    Adicionar Instagram, YouTube e outras redes
                  </button>
                ) : null
              }
            />
          </div>
        </div>

        {!isOwnProfile && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={handleMessageClick}
              disabled={isStartingChat}
              className="flex items-center justify-center gap-2 min-h-11 px-4 py-2 bg-gray-100 dark:bg-[#2A3B42] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {isStartingChat ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Mensagem</span>
            </button>
            <FollowButton userId={profile.user_id} />
            <ReportProfileModal reportedUserId={profile.user_id} reportedUserName={displayName} />
          </div>
        )}

        {isOwnProfile && onEditClick && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onEditClick}
              className="flex items-center gap-2 min-h-11 px-5 py-2 bg-gray-100 dark:bg-[#2A3B42] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full font-bold text-sm transition-colors shadow-sm"
            >
              Editar Perfil
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 px-2 border-t border-gray-200 dark:border-gray-800 pt-4">
        {isOwnProfile && (
          <CreatePostModal
            triggerNode={
              <button className="flex items-center gap-2 min-h-11 px-5 py-2 rounded-full text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <Plus className="w-4 h-4" />
                Postar
              </button>
            }
          />
        )}
        <button className="min-h-11 min-w-11 p-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#2A3B42] text-gray-800 dark:text-gray-200 transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProfileMainHeader;
