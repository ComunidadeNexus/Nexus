import { Award, Trophy, Star, Medal, Crown, Gem, Heart, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  xp_reward: number;
}

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

interface ProfileBadgesProps {
  badges: UserBadge[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  award: Award,
  trophy: Trophy,
  star: Star,
  medal: Medal,
  crown: Crown,
  gem: Gem,
  heart: Heart,
  zap: Zap,
};

const ProfileBadges = ({ badges }: ProfileBadgesProps) => {
  if (badges.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Badges
        </h3>
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma badge conquistada ainda. Continue participando!
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-primary" />
        Badges ({badges.length})
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {badges.map((userBadge) => {
          const IconComponent = iconMap[userBadge.badge.icon] || Award;
          
          return (
            <div
              key={userBadge.id}
              className={cn(
                "p-3 rounded-lg text-center",
                "bg-white/5 hover:bg-white/10 transition-colors"
              )}
              title={userBadge.badge.description}
            >
              <div
                className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2"
                style={{ backgroundColor: `${userBadge.badge.color}20` }}
              >
                <IconComponent
                  className="w-5 h-5"
                  style={{ color: userBadge.badge.color }}
                />
              </div>
              <p className="text-sm font-medium truncate">{userBadge.badge.name}</p>
              <p className="text-xs text-muted-foreground">+{userBadge.badge.xp_reward} XP</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileBadges;
