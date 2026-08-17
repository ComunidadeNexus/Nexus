import { Progress } from "@/components/ui/progress";
import { Star, Zap } from "lucide-react";

interface LevelProgressProps {
  level: number;
  progress: {
    current: number;
    required: number;
    percentage: number;
  };
}

const levelTitles: Record<number, string> = {
  1: "Iniciante",
  2: "Aprendiz",
  3: "Participante",
  4: "Colaborador",
  5: "Expert",
  6: "Mestre",
  7: "Lenda",
  8: "Visionário",
  9: "Elite",
  10: "Supremo",
};

const LevelProgress = ({ level, progress }: LevelProgressProps) => {
  const title = levelTitles[level] || `Nível ${level}`;

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Star className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Nível {level}</h3>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-primary">
            <Zap className="w-4 h-4" />
            <span className="font-bold">{progress.current}</span>
            <span className="text-muted-foreground">/ {progress.required} XP</span>
          </div>
        </div>
      </div>

      <Progress value={progress.percentage} className="h-3" />
      
      <p className="text-xs text-muted-foreground text-center mt-2">
        {Math.round(progress.required - progress.current)} XP para o próximo nível
      </p>
    </div>
  );
};

export default LevelProgress;
