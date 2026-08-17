import { Users, Lock, CheckCircle, Settings, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Nucleo } from "@/hooks/useNucleos";
import { useAuth } from "@/contexts/AuthContext";

interface NucleoHeaderProps {
  nucleo: Nucleo;
  isMember: boolean;
  isOwner: boolean;
  isModerator: boolean;
  onJoin: () => void;
  onLeave: () => void;
}

const NucleoHeader = ({
  nucleo,
  isMember,
  isOwner,
  isModerator,
  onJoin,
  onLeave,
}: NucleoHeaderProps) => {
  const { user } = useAuth();

  return (
    <div className="relative">
      {/* Banner */}
      <div
        className="h-32 md:h-48 w-full"
        style={{
          background: nucleo.banner_url
            ? `url(${nucleo.banner_url}) center/cover`
            : `linear-gradient(135deg, ${nucleo.color}40, ${nucleo.color}80)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 relative">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl">
            <AvatarImage src={nucleo.avatar_url || undefined} />
            <AvatarFallback
              style={{ backgroundColor: nucleo.color }}
              className="text-white font-bold text-3xl"
            >
              {nucleo.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold">{nucleo.name}</h1>
              {nucleo.is_verified && (
                <CheckCircle className="w-5 h-5 text-primary" />
              )}
              {nucleo.is_private && (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="w-3 h-3" />
                  Privado
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground mt-1 max-w-xl">
              {nucleo.description || "Sem descrição"}
            </p>

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{nucleo.members_count} membros</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{nucleo.posts_count} posts</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pb-2">
            {user && (
              <>
                {isMember ? (
                  <>
                    {isOwner && (
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Gerenciar
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onLeave}
                      disabled={isOwner}
                    >
                      {isOwner ? (
                        <>
                          <Crown className="w-4 h-4 mr-2" />
                          Dono
                        </>
                      ) : isModerator ? (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Moderador
                        </>
                      ) : (
                        "Sair"
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={onJoin}
                    style={{ backgroundColor: nucleo.color }}
                  >
                    Entrar no Núcleo
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NucleoHeader;
