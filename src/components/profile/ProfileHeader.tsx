import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, MessageCircle, CheckCircle, Calendar, Crown
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import EditProfileModal from "./EditProfileModal";
import FollowButton from "./FollowButton";
import { useNavigate } from "react-router-dom";
import { useDirectMessages } from "@/hooks/useDirectMessages";
import { useFollowers } from "@/hooks/useFollowers";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

interface Profile {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  is_banned: boolean;
  created_at: string;
}

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
  onUpdate: (updates: { name?: string; avatar_url?: string; bio?: string }) => Promise<{ error: string | null }>;
  onRefetch: () => void;
}

const ProfileHeader = ({ profile, isOwnProfile, onUpdate, onRefetch }: ProfileHeaderProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const navigate = useNavigate();
  const { startConversation } = useDirectMessages();
  const { followersCount, followingCount } = useFollowers(profile.user_id);
  const { subscribed, tier } = useSubscription();

  const handleStartConversation = async () => {
    const { error, conversationId } = await startConversation(profile.user_id);
    if (error) {
      toast.error("Erro ao iniciar conversa");
      return;
    }
    if (conversationId) {
      navigate(`/mensagens/${conversationId}`);
    }
  };

  const initials = profile.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <>
      <div className="glass-card rounded-xl overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-br from-primary/30 to-secondary/30" />

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <Avatar className="w-24 h-24 border-4 border-background">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl bg-primary/20">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{profile.name || "Usuário"}</h1>
                {profile.is_verified && (
                  <CheckCircle className="w-5 h-5 text-primary fill-primary/20" />
                )}
                {isOwnProfile && subscribed && tier !== "free" && (
                  <Badge 
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white cursor-pointer hover:opacity-90"
                    onClick={() => navigate("/assinatura")}
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    {tier === "enterprise" ? "Enterprise" : "Pro"}
                  </Badge>
                )}
                {profile.is_banned && (
                  <Badge variant="destructive">Banido</Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Membro desde {format(new Date(profile.created_at), "MMM yyyy", { locale: ptBR })}
                </span>
              </div>

              {/* Followers Stats */}
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span><strong>{followersCount}</strong> seguidores</span>
                <span><strong>{followingCount}</strong> seguindo</span>
              </div>

              {profile.bio && (
                <p className="text-muted-foreground mt-3">{profile.bio}</p>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              {isOwnProfile ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditOpen(true)}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Perfil
                  </Button>
                  {!subscribed || tier === "free" ? (
                    <Button
                      variant="default"
                      onClick={() => navigate("/assinatura")}
                      className="gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
                    >
                      <Crown className="w-4 h-4" />
                      Seja Premium
                    </Button>
                  ) : null}
                </>
              ) : (
                <div className="flex gap-2">
                  <FollowButton userId={profile.user_id} />
                  <Button
                    variant="outline"
                    onClick={handleStartConversation}
                    className="gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Mensagem
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        profile={profile}
        onUpdate={onUpdate}
        onRefetch={onRefetch}
      />
    </>
  );
};

export default ProfileHeader;
