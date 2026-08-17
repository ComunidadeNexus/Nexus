import { useNavigate } from "react-router-dom";
import { Users, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Nucleo } from "@/hooks/useNucleos";

interface NucleoCardProps {
  nucleo: Nucleo;
  isMember: boolean;
  onJoin: (nucleoId: string) => void;
  onLeave: (nucleoId: string) => void;
}

const NucleoCard = ({ nucleo, isMember, onJoin, onLeave }: NucleoCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/nucleo/${nucleo.slug}`)}
    >
      {/* Banner */}
      <div 
        className="h-20 relative"
        style={{ 
          background: nucleo.banner_url 
            ? `url(${nucleo.banner_url}) center/cover` 
            : `linear-gradient(135deg, ${nucleo.color}40, ${nucleo.color}80)`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <CardContent className="p-4 -mt-8 relative">
        <div className="flex items-start gap-3">
          <Avatar className="h-14 w-14 border-4 border-background shadow-lg">
            <AvatarImage src={nucleo.avatar_url || undefined} />
            <AvatarFallback 
              style={{ backgroundColor: nucleo.color }}
              className="text-white font-bold text-lg"
            >
              {nucleo.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0 pt-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">
                {nucleo.name}
              </h3>
              {nucleo.is_verified && (
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              )}
              {nucleo.is_private && (
                <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {nucleo.description || "Sem descrição"}
            </p>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{nucleo.members_count} membros</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
          {isMember ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onLeave(nucleo.id)}
            >
              Sair
            </Button>
          ) : (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onJoin(nucleo.id)}
              style={{ backgroundColor: nucleo.color }}
            >
              Entrar
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/nucleo/${nucleo.slug}`)}
          >
            Ver
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NucleoCard;
