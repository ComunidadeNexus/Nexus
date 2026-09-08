import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useNucleos, Nucleo } from "@/hooks/useNucleos";
import { X, Globe, EyeOff, Lock } from "lucide-react";
import FileUpload from "@/components/upload/FileUpload";

interface EditNucleoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nucleo: Nucleo;
  onSuccess?: () => void;
}

const EditNucleoModal = ({ open, onOpenChange, nucleo, onSuccess }: EditNucleoModalProps) => {
  const [name, setName] = useState(nucleo.name);
  const [description, setDescription] = useState(nucleo.description || "");
  const [privacy, setPrivacy] = useState<"public" | "restricted" | "private">(
    nucleo.is_private ? "private" : "public",
  );
  const [avatarUrl, setAvatarUrl] = useState(nucleo.avatar_url || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateNucleo } = useNucleos();

  const handleUpdate = async () => {
    if (!name.trim()) return;

    const isPrivate = privacy === "private" || privacy === "restricted";

    setIsUpdating(true);
    const success = await updateNucleo(nucleo.id, {
      name,
      description,
      is_private: isPrivate,
      avatar_url: avatarUrl || undefined,
    });
    setIsUpdating(false);

    if (success) {
      onOpenChange(false);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] p-0 bg-[#121212] border border-gray-800 text-white rounded-2xl shadow-2xl [&>button]:hidden">
        {/* Header Customizado */}
        <div className="flex justify-between items-start p-6 pb-4 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold mb-1">Editar Comunidade</h2>
            <p className="text-sm text-gray-400">
              Atualize as informações do núcleo n/{nucleo.slug}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-full transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content Area */}
        <div className="px-6 py-4 flex flex-col gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4 bg-[#2A2A2A] p-4 rounded-xl">
            <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-[#1A1A1A] border border-gray-700 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-500 font-bold text-xl">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white mb-1">Ícone da Comunidade</h4>
              <p className="text-xs text-gray-400 mb-2">
                Um ícone ajuda sua comunidade a se destacar.
              </p>
              <FileUpload
                bucket="avatars"
                onUpload={(url) => setAvatarUrl(url)}
                accept="image/*"
                maxSize={2}
                preview={false}
                className="!p-2"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-300">Nome da comunidade</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#2A2A2A] border-none rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-300">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px] bg-[#2A2A2A] border-none rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-sm font-bold text-gray-300 mb-1">Privacidade</label>
            <label
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${privacy === "public" ? "border-primary bg-primary/5" : "border-gray-800 bg-[#1A1A1A]"}`}
            >
              <Globe className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <div className="font-bold text-sm text-white">Pública</div>
              </div>
              <input
                type="radio"
                checked={privacy === "public"}
                onChange={() => setPrivacy("public")}
                className="w-4 h-4 accent-primary"
              />
            </label>

            <label
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${privacy === "private" ? "border-primary bg-primary/5" : "border-gray-800 bg-[#1A1A1A]"}`}
            >
              <Lock className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <div className="font-bold text-sm text-white">Privada</div>
              </div>
              <input
                type="radio"
                checked={privacy === "private"}
                onChange={() => setPrivacy("private")}
                className="w-4 h-4 accent-primary"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-end border-t border-gray-800 bg-[#121212] rounded-b-2xl gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="px-6 py-2.5 rounded-full text-sm font-bold bg-[#2A2A2A] text-white hover:bg-[#3A3A3A] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpdate}
            disabled={!name.trim() || isUpdating}
            className="px-6 py-2.5 bg-gradient-to-r from-[#00C6FF] to-[#FF007F] text-white rounded-full text-sm font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isUpdating ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditNucleoModal;
