import { useParams, useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import BottomNavigation from "@/components/BottomNavigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import LevelProgress from "@/components/profile/LevelProgress";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileBadges from "@/components/profile/ProfileBadges";
import ProfileActivity from "@/components/profile/ProfileActivity";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, badges, stats, isLoading, isOwnProfile, levelProgress, updateProfile, refetch } = useProfile(userId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Perfil não encontrado</h1>
          <Button onClick={() => navigate("/comunidade")}>
            Voltar para a Comunidade
          </Button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 pb-12 max-w-4xl">
        <div className="space-y-6">
          <ProfileHeader
            profile={profile}
            isOwnProfile={isOwnProfile}
            onUpdate={updateProfile}
            onRefetch={refetch}
          />

          <LevelProgress
            level={profile.level}
            progress={levelProgress}
          />

          <ProfileStats
            xpPoints={profile.xp_points}
            postsCount={stats.postsCount}
            commentsCount={stats.commentsCount}
            karma={profile.karma}
          />

          <ProfileBadges badges={badges} />

          <ProfileActivity userId={profile.user_id} />
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
