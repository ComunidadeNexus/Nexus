import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import ProfileMainHeader from "@/components/profile/ProfileMainHeader";
import ProfileSidebarWidget from "@/components/profile/ProfileSidebarWidget";
import ProfileActivity from "@/components/profile/ProfileActivity";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditProfileModal from "@/components/profile/EditProfileModal";

import { ProfileComments } from "@/components/profile/ProfileComments";
import { ProfileSaved } from "@/components/profile/ProfileSaved";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, badges, stats, isLoading, isOwnProfile, levelProgress, updateProfile, refetch } =
    useProfile(userId);

  const [activeTab, setActiveTab] = useState("posts");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold mb-4">Perfil não encontrado</h1>
        <Button onClick={() => navigate("/comunidade")}>Voltar para a Comunidade</Button>
      </div>
    );
  }

  return (
    <div className="w-full flex gap-6">
      {/* Coluna Esquerda: Conteúdo Principal */}
      <div className="flex-1 w-full min-w-0 max-w-[640px]">
        <ProfileMainHeader
          profile={profile}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOwnProfile={isOwnProfile}
          onEditClick={() => setIsEditModalOpen(true)}
        />

        <div className="mt-4">
          {activeTab === "posts" && <ProfileActivity userId={profile.user_id} />}
          {activeTab === "comentarios" && <ProfileComments userId={profile.user_id} />}
          {activeTab === "salvo" && <ProfileSaved userId={profile.user_id} />}
          {activeTab === "historico" && <ProfileSaved userId={profile.user_id} />}
          {activeTab === "visao_geral" && (
            <div className="p-8 bg-white dark:bg-[#1A282D] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <h2 className="text-lg font-bold mb-4 gradient-text">
                Sobre {profile.name || profile.username}
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {profile.bio || "Nenhuma biografia disponível."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Coluna Direita: Widget */}
      <div className="hidden lg:block w-[310px] shrink-0">
        <ProfileSidebarWidget
          profile={profile}
          levelProgress={levelProgress}
          badges={badges}
          isOwnProfile={isOwnProfile}
          onEditClick={() => setIsEditModalOpen(true)}
        />
      </div>

      {/* Modal de Edição de Perfil */}
      {isOwnProfile && (
        <EditProfileModal
          profile={profile}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onUpdate={updateProfile}
          onRefetch={refetch}
        />
      )}
    </div>
  );
};

export default Profile;
