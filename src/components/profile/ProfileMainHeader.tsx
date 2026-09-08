import React, { useState } from "react";
import { Camera, Plus, SlidersHorizontal, MessageCircle, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CreatePostModal from "@/components/community/CreatePostModal";
import ReportProfileModal from "@/components/profile/ReportProfileModal";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProfileMainHeaderProps {
  profile: {
    user_id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
    bio: string | null;
  };
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOwnProfile?: boolean;
  onEditClick?: () => void;
}

const ProfileMainHeader = ({
  profile,
  activeTab,
  onTabChange,
  isOwnProfile,
  onEditClick,
}: ProfileMainHeaderProps) => {
  const displayName = profile.name || profile.username || "Usuário";
  const handle = profile.username ? `u/${profile.username}` : "u/usuario";

  const { startConversation } = useDirectMessages();
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
      {/* Profile Info Row */}
      <div className="flex items-center justify-between gap-4 mb-6 px-2">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16 bg-white dark:bg-[#1A282D] border-2 border-primary/20">
              <AvatarImage
                src={profile.avatar_url || undefined}
                alt={displayName}
                className="object-cover"
              />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <div className="absolute bottom-0 right-0 bg-primary p-1.5 rounded-full text-white cursor-pointer hover:bg-primary/80 transition-colors border-2 border-white dark:border-[#0B1416]">
                <Camera className="w-3 h-3" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">{displayName}</h1>
            <p className="text-sm text-gray-500 font-medium">{handle}</p>
            {profile.bio && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 max-w-md">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons for Other Profiles */}
        {!isOwnProfile && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleMessageClick}
              disabled={isStartingChat}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#2A3B42] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {isStartingChat ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Mensagem</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#00C6FF] to-[#FF007F] hover:opacity-90 text-white rounded-full font-bold text-sm transition-opacity shadow-md">
              Seguir
            </button>
            <ReportProfileModal reportedUserId={profile.user_id} reportedUserName={displayName} />
          </div>
        )}

        {isOwnProfile && onEditClick && (
          <div className="flex items-center gap-2">
            <button
              onClick={onEditClick}
              className="flex items-center gap-2 px-6 py-2 bg-gray-100 dark:bg-[#2A3B42] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full font-bold text-sm transition-colors shadow-sm"
            >
              Editar Perfil
            </button>
          </div>
        )}
      </div>

      {/* Tabs Pills (Removed as requested) */}

      {/* Ações (Postar e Filtro) */}
      <div className="flex items-center gap-3 px-2 border-t border-gray-200 dark:border-gray-800 pt-4">
        {isOwnProfile && (
          <CreatePostModal
            triggerNode={
              <button className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <Plus className="w-4 h-4" />
                Postar
              </button>
            }
          />
        )}
        <button className="p-2 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#2A3B42] text-gray-800 dark:text-gray-200 transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProfileMainHeader;
