import { useState } from "react";
import { Users, Lock, CheckCircle, Settings, Crown, Shield, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNucleos, type Nucleo } from "@/hooks/useNucleos";
import { useAuth } from "@/contexts/AuthContext";
import EditNucleoModal from "./EditNucleoModal";
import { useNavigate } from "react-router-dom";

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
  const { deleteNucleo } = useNucleos();
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await deleteNucleo(nucleo.id);
    setIsDeleting(false);
    if (success) {
      navigate("/nucleos");
    }
  };

  const actionButtons = user ? (
    isMember ? (
      <>
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-[#1A1A1A] border-gray-800 text-white"
            >
              <DropdownMenuItem
                onClick={() => setIsEditModalOpen(true)}
                className="hover:bg-[#2A2A2A] cursor-pointer"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Editar Comunidade
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer focus:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Comunidade
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button variant="outline" size="sm" onClick={onLeave} disabled={isOwner}>
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
      <Button onClick={onJoin} style={{ backgroundColor: nucleo.color }}>
        Entrar no Núcleo
      </Button>
    )
  ) : null;

  return (
    <div className="relative">
      <EditNucleoModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} nucleo={nucleo} />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#121212] border border-gray-800 text-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-500">Excluir Comunidade</DialogTitle>
            <DialogDescription className="text-gray-400">
              Você tem certeza que deseja excluir a comunidade <strong>n/{nucleo.slug}</strong>?
              Esta ação é irreversível e apagará todos os posts e membros vinculados a ela.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
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
              {isDeleting ? "Excluindo..." : "Sim, Excluir Comunidade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Banner */}
      <div
        className="h-24 md:h-48 w-full"
        style={{
          background: nucleo.banner_url
            ? `url(${nucleo.banner_url}) center/cover`
            : `linear-gradient(135deg, ${nucleo.color}40, ${nucleo.color}80)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content — mobile: avatar + name + join in Reddit community header order */}
      <div className="max-w-4xl mx-auto px-3 md:px-4 -mt-8 md:-mt-16 relative">
        <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4">
          <div className="flex items-end gap-3 flex-1 min-w-0">
            <Avatar className="h-16 w-16 md:h-32 md:w-32 border-4 border-background shadow-xl bg-[#1A1A1A] shrink-0">
              <AvatarImage src={nucleo.avatar_url || undefined} className="object-cover" />
              <AvatarFallback
                style={{ backgroundColor: nucleo.color }}
                className="text-white font-bold text-xl md:text-3xl"
              >
                {nucleo.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 pb-1 md:pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg md:text-3xl font-bold">{nucleo.name}</h1>
                    {nucleo.is_verified && (
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    )}
                    {nucleo.is_private && (
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="w-3 h-3" />
                        Privado
                      </Badge>
                    )}
                  </div>

                  <p className="text-muted-foreground mt-1 max-w-xl max-md:line-clamp-2 max-md:text-sm">
                    {nucleo.description || "Sem descrição"}
                  </p>

                  <div className="flex items-center gap-3 md:gap-4 mt-1.5 md:mt-3 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span>{nucleo.members_count} membros</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{nucleo.posts_count} posts</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0 md:hidden">
                  {actionButtons}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex gap-2 pb-2">{actionButtons}</div>
        </div>
      </div>
    </div>
  );
};

export default NucleoHeader;
