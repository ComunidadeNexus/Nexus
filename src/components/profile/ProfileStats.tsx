import { Zap, FileText, MessageSquare, TrendingUp } from "lucide-react";

interface ProfileStatsProps {
  xpPoints: number;
  postsCount: number;
  commentsCount: number;
  karma: number;
}

const ProfileStats = ({
  xpPoints,
  postsCount,
  commentsCount,
  karma,
}: ProfileStatsProps) => {
  const stats = [
    { label: "XP Total", value: xpPoints, icon: Zap, color: "text-primary" },
    { label: "Karma", value: karma, icon: TrendingUp, color: "text-orange-400" },
    { label: "Posts", value: postsCount, icon: FileText, color: "text-blue-400" },
    { label: "Comentários", value: commentsCount, icon: MessageSquare, color: "text-green-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="glass-card rounded-xl p-4 text-center"
        >
          <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
          <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default ProfileStats;
