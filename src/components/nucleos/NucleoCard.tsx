import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import type { Nucleo } from "@/hooks/useNucleos";

interface NucleoCardProps {
  nucleo: Nucleo;
  isMember: boolean;
  onJoin: (nucleoId: string) => void;
  onLeave: (nucleoId: string) => void;
  onDelete: (nucleoId: string) => Promise<boolean>;
}

const NucleoCard = ({ nucleo, isMember, onJoin, onLeave, onDelete }: NucleoCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOwner = Boolean(user && user.id === nucleo.owner_id);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await onDelete(nucleo.id);
    setIsDeleting(false);
    if (success) setIsDeleteOpen(false);
  };

  return (
    <>
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
              : `linear-gradient(135deg, ${nucleo.color}40, ${nucleo.color}80)`,
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
                <h3 className="font-semibold text-foreground truncate">{nucleo.name}</h3>
                {nucleo.is_verified && <CheckCircle className="w-4 h-4 text-primary shrink-0" />}
                {nucleo.is_private && <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
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
            {isOwner ? (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-red-500 hover:text-red-400"
                onClick={() => setIsDeleteOpen(true)}
              >
                Excluir
              </Button>
            ) : isMember ? (
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
            <Button variant="ghost" size="sm" onClick={() => navigate(`/nucleo/${nucleo.slug}`)}>
              Ver
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-[#121212] border border-gray-800 text-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-500">Excluir Comunidade</DialogTitle>
            <DialogDescription className="text-gray-400">
              Excluir <strong>n/{nucleo.slug}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteOpen(false)}
              className="text-gray-300 hover:text-white hover:bg-[#2A2A2A]"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Sim, Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NucleoCard;
