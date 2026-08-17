import { Trophy, Target, Medal, Flame, Star, Crown, Award, Zap } from "lucide-react";

const badges = [
  { icon: Crown, label: "Líder", color: "text-gold", bg: "bg-gold/20" },
  { icon: Star, label: "Estrela", color: "text-primary", bg: "bg-primary/20" },
  { icon: Flame, label: "Em Fogo", color: "text-destructive", bg: "bg-destructive/20" },
  { icon: Award, label: "Expert", color: "text-secondary", bg: "bg-secondary/20" },
];

const leaderboard = [
  { rank: 1, name: "Ana Silva", points: 12450, avatar: "AS", level: 42 },
  { rank: 2, name: "Carlos Mendes", points: 11200, avatar: "CM", level: 38 },
  { rank: 3, name: "Marina Santos", points: 10800, avatar: "MS", level: 35 },
  { rank: 4, name: "Pedro Oliveira", points: 9500, avatar: "PO", level: 32 },
  { rank: 5, name: "Julia Costa", points: 8900, avatar: "JC", level: 30 },
];

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1: return "text-gold";
    case 2: return "text-silver";
    case 3: return "text-bronze";
    default: return "text-muted-foreground";
  }
};

const GamificationSection = () => {
  return (
    <section id="gamification" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <Trophy className="w-4 h-4 text-gold" />
            <span className="text-sm text-muted-foreground">Gamificação Avançada</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Transforme engajamento em{' '}
            <span className="gradient-text">conquistas</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Sistema completo de pontos, níveis, rankings e conquistas para manter sua comunidade ativa.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leaderboard */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">Ranking Semanal</h3>
                <p className="text-sm text-muted-foreground">Top 5 da comunidade</p>
              </div>
            </div>

            <div className="space-y-3">
              {leaderboard.map((user) => (
                <div
                  key={user.rank}
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <span className={`font-display text-2xl font-bold w-8 ${getRankColor(user.rank)}`}>
                    #{user.rank}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-semibold">
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">Nível {user.level}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-primary">
                      {user.points.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            {/* Badges Preview */}
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Medal className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">Conquistas</h3>
                  <p className="text-sm text-muted-foreground">Desbloqueie badges exclusivos</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.label}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <div className={`w-12 h-12 rounded-full ${badge.bg} flex items-center justify-center`}>
                      <badge.icon className={`w-6 h-6 ${badge.color}`} />
                    </div>
                    <span className="text-xs font-medium">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missions */}
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">Missões Diárias</h3>
                  <p className="text-sm text-muted-foreground">Complete desafios e ganhe XP</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                  <div className="w-10 h-10 rounded-xl bg-xp/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-xp" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Faça 5 comentários</div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full w-3/5" />
                    </div>
                  </div>
                  <span className="text-primary font-bold">+50 XP</span>
                </div>

                <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <Star className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Receba 10 curtidas</div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full w-4/5" />
                    </div>
                  </div>
                  <span className="text-primary font-bold">+100 XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GamificationSection;
