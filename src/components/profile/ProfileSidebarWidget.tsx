import React, { useState } from "react";
import { Share, Camera, Eye, Settings, Shield } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Badge {
  id: string;
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    xp_reward: number;
  };
}

interface ProfileSidebarWidgetProps {
  profile: {
    name: string | null;
    username: string | null;
    level: number;
    karma: number;
    xp_points: number;
    created_at: string;
    banner_url?: string | null;
  };
  levelProgress: {
    current: number;
    required: number;
    percentage: number;
  };
  badges: Badge[];
  isOwnProfile: boolean;
  onEditClick: () => void;
}

const ProfileSidebarWidget = ({
  profile,
  levelProgress,
  badges,
  isOwnProfile,
  onEditClick,
}: ProfileSidebarWidgetProps) => {
  const displayName = profile.name || profile.username || "Usuário";
  const joinYear = new Date(profile.created_at).getFullYear();
  const navigate = useNavigate();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link do perfil copiado para a área de transferência!");
  };

  const handleVisibilityClick = () => {
    toast.info("A configuração de visibilidade será implementada nas próximas atualizações!");
  };

  const [bannerUrl, setBannerUrl] = useState<string | null>(
    profile.banner_url || localStorage.getItem("temp_banner_url"),
  );
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleBannerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 2MB");
        e.target.value = "";
        return;
      }

      const toastId = toast.loading("Fazendo upload da capa...");

      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, file, { cacheControl: "3600", upsert: false });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(uploadData.path);

        setBannerUrl(publicUrl);
        localStorage.setItem("temp_banner_url", publicUrl);

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ banner_url: publicUrl })
          .eq("user_id", user.id);

        if (updateError) throw updateError;

        toast.success("Capa atualizada com sucesso!", { id: toastId });
      } catch (error: any) {
        toast.error("Erro ao atualizar a capa: " + error.message, { id: toastId });
      }
    }
    // Esvazia o input para permitir selecionar o mesmo arquivo novamente
    e.target.value = "";
  };

  const handleVerTudo = () => {
    toast.info("A galeria completa de conquistas estará disponível em breve!");
  };

  return (
    <div className="bg-white dark:bg-[#0B1416] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden sticky top-[84px] shadow-sm relative">
      {/* Fundo da Capa (Absolute) */}
      <div className="absolute top-0 left-0 w-full h-[280px] bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-700 overflow-hidden rounded-t-xl z-0">
        {bannerUrl && (
          <img src={bannerUrl} alt="Capa do Perfil" className="w-full h-full object-cover" />
        )}
        {/* Overlay para escurecer a base da capa, melhorando a leitura do texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1416] via-[#0B1416]/60 to-transparent pointer-events-none"></div>
      </div>

      {isOwnProfile && (
        <label className="absolute top-3 right-3 bg-black/50 p-2 rounded-full text-white cursor-pointer hover:bg-black/70 transition-colors z-20">
          <Camera className="w-4 h-4" />
          <input
            type="file"
            className="hidden"
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
        </label>
      )}

      {/* Conteúdo (Sobreposto à capa) */}
      <div className="px-4 pb-4 pt-16 relative z-10 pointer-events-none">
        {/* Wrap content inside a pointer-events-auto div to allow interacting with the profile text but letting clicks pass through the padding */}
        <div className="pointer-events-auto">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 drop-shadow-md">
            {displayName}
          </h2>

          <button
            onClick={handleShare}
            className="h-8 rounded-full text-xs font-bold px-3 flex items-center gap-2 bg-gray-100/90 dark:bg-black/40 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-black/60 transition-colors mb-4 text-gray-900 dark:text-white"
          >
            <Share className="w-3 h-3" /> Compartilhar
          </button>

          <div className="text-xs text-gray-900 dark:text-gray-200 mb-4 font-bold drop-shadow-md">
            0 seguidor
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-y-5 gap-x-2 text-xs mb-6">
            <div>
              <div className="font-bold text-sm text-primary">{profile.karma}</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Karma</div>
            </div>
            <div>
              <div className="font-bold text-sm text-primary">{profile.level}</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Nível</div>
            </div>
            <div>
              <div className="font-bold text-sm text-gray-900 dark:text-white">{joinYear}</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Entrou em</div>
            </div>
            <div>
              <div className="font-bold text-sm text-primary">{profile.xp_points}</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">XP Atual</div>
            </div>
          </div>

          <div className="h-px w-full bg-gray-200 dark:bg-gray-800 my-4" />

          {/* Conquistas (Badges) */}
          <div className="mb-4">
            <div className="text-[10px] font-bold text-gray-500 mb-3 tracking-wider">
              CONQUISTAS
            </div>
            <div className="flex gap-1 items-center">
              {badges.length > 0 ? (
                badges.slice(0, 3).map((b, i) => (
                  <div
                    key={b.id}
                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-white text-xs font-bold shadow-sm"
                    style={{ backgroundColor: b.badge.color || "#3b82f6", zIndex: 10 - i }}
                    title={b.badge.name}
                  >
                    {b.badge.name.charAt(0)}
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500">Você ainda não tem conquistas.</div>
              )}

              {badges.length > 3 && (
                <div className="text-xs text-gray-500 ml-2 font-medium">
                  +{badges.length - 3} mais
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-500">Você desbloqueou {badges.length}</span>
              <button
                onClick={handleVerTudo}
                className="px-3 py-1 bg-gray-100 dark:bg-[#1A282D] border border-gray-200 dark:border-gray-700 text-xs font-bold rounded-full hover:bg-gray-200 dark:hover:bg-[#2A3B42] transition-colors"
              >
                Ver tudo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebarWidget;
