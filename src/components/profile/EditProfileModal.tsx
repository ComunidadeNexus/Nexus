import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import FileUpload from "@/components/upload/FileUpload";
import ProfileSocialFields from "@/components/profile/ProfileSocialFields";
import type { ProfileUpdates } from "@/hooks/useProfile";
import {
  parseSocialLinkDrafts,
  sanitizeProfileCategories,
  validateSocialLinkDrafts,
  type ProfileCategoryKey,
  type SocialLinks,
  type SocialNetworkKey,
} from "@/lib/profileSocial";

interface Profile {
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  profile_categories?: ProfileCategoryKey[];
  social_links?: SocialLinks;
}

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  onUpdate: (updates: ProfileUpdates) => Promise<{ error: string | null }>;
  onRefetch: () => void;
}

const EditProfileModal = ({
  open,
  onOpenChange,
  profile,
  onUpdate,
  onRefetch,
}: EditProfileModalProps) => {
  const [name, setName] = useState(profile.name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [categories, setCategories] = useState<ProfileCategoryKey[]>(
    sanitizeProfileCategories(profile.profile_categories),
  );
  const [socialDrafts, setSocialDrafts] = useState(parseSocialLinkDrafts(profile.social_links));
  const [socialErrors, setSocialErrors] = useState<Partial<Record<SocialNetworkKey, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(profile.name || "");
    setBio(profile.bio || "");
    setAvatarUrl(profile.avatar_url || "");
    setCategories(sanitizeProfileCategories(profile.profile_categories));
    setSocialDrafts(parseSocialLinkDrafts(profile.social_links));
    setSocialErrors({});
  }, [open, profile]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    const { links, errors } = validateSocialLinkDrafts(socialDrafts);
    setSocialErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Corrija os links sociais (apenas https://)");
      return;
    }

    setIsSubmitting(true);

    const { error } = await onUpdate({
      name: name.trim(),
      bio: bio.trim() || undefined,
      avatar_url: avatarUrl || undefined,
      profile_categories: categories,
      social_links: links,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error("Erro ao atualizar perfil");
      return;
    }

    toast.success("Perfil atualizado!");
    onRefetch();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90dvh,52rem)] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 space-y-1 px-6 pb-3 pt-6 text-left">
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Instagram, YouTube e as outras redes você configura aqui, com o seu link.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-2">
          <div className="space-y-5 pb-2">
            <div className="space-y-2">
              <Label htmlFor="edit-profile-name">Nome</Label>
              <Input
                id="edit-profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-profile-bio">Bio</Label>
              <Textarea
                id="edit-profile-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte um pouco sobre você..."
                rows={3}
              />
            </div>

            <ProfileSocialFields
              categories={categories}
              onCategoriesChange={setCategories}
              socialDrafts={socialDrafts}
              onSocialDraftChange={(key, value) =>
                setSocialDrafts((current) => ({ ...current, [key]: value }))
              }
              socialErrors={socialErrors}
            />

            <div className="space-y-2">
              <Label>Foto de Perfil</Label>
              <FileUpload
                bucket="avatars"
                accept="image/*"
                maxSize={5}
                onUpload={(url) => setAvatarUrl(url)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-gray-200 px-6 py-4 dark:border-gray-800 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="!h-11 !min-h-[44px]">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
