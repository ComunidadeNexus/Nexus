import React, { useEffect, useState } from "react";
import { User, Lock, Shield, Bell, LogOut, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import ProfileSocialFields from "@/components/profile/ProfileSocialFields";
import {
  parseSocialLinkDrafts,
  sanitizeProfileCategories,
  validateSocialLinkDrafts,
  type ProfileCategoryKey,
  type SocialNetworkKey,
} from "@/lib/profileSocial";

const Configuracoes = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { profile, updateProfile, isLoading: profileLoading } = useProfile();
  const [activeTab, setActiveTab] = useState("profile");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [categories, setCategories] = useState<ProfileCategoryKey[]>([]);
  const [socialDrafts, setSocialDrafts] = useState(parseSocialLinkDrafts(undefined));
  const [socialErrors, setSocialErrors] = useState<Partial<Record<SocialNetworkKey, string>>>({});
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || "");
    setBio(profile.bio || "");
    setCategories(sanitizeProfileCategories(profile.profile_categories));
    setSocialDrafts(parseSocialLinkDrafts(profile.social_links));
  }, [profile]);

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Preencha ambos os campos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      toast.success("Senha atualizada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Tente de novo.";
      toast.error("Erro ao atualizar senha: " + message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSaveProfileSocial = async () => {
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

    setIsSavingProfile(true);
    const { error } = await updateProfile({
      name: name.trim(),
      bio: bio.trim() || undefined,
      profile_categories: categories,
      social_links: links,
    });
    setIsSavingProfile(false);

    if (error) {
      toast.error("Erro ao salvar perfil");
      return;
    }
    toast.success("Perfil atualizado!");
  };

  const handleLogout = () => {
    void signOut();
  };

  const tabs = [
    { id: "profile", label: "Editar Perfil", icon: User },
    { id: "privacy", label: "Privacidade", icon: Shield },
    { id: "security", label: "Segurança", icon: Lock },
    { id: "notifications", label: "Notificações", icon: Bell },
  ];

  return (
    <div className="max-w-4xl mx-auto w-full pb-16 md:pb-0">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Configurações</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar de Navegação */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-[#1A282D] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between min-h-11 p-4 transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary border-r-2 border-primary"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2A3B42]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 ${isActive ? "text-primary" : "text-gray-400"}`}
                  />
                </button>
              );
            })}

            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 min-h-11 p-2 rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair da conta</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Área de Conteúdo */}
        <div className="flex-1">
          <div className="bg-white dark:bg-[#1A282D] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Editar Perfil
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Coloque seus links do Instagram, YouTube, X, LinkedIn, TikTok e site. Você pode
                  colar a URL ou só o @usuario.
                </p>
                {profileLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Carregando perfil...
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="settings-name">Nome</Label>
                      <Input
                        id="settings-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="settings-bio">Bio</Label>
                      <Textarea
                        id="settings-bio"
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
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button
                        className="!h-11 !min-h-[44px]"
                        onClick={handleSaveProfileSocial}
                        disabled={isSavingProfile}
                      >
                        {isSavingProfile ? "Salvando..." : "Salvar perfil"}
                      </Button>
                      <Button
                        variant="outline"
                        className="!h-11 !min-h-[44px]"
                        onClick={() => navigate("/perfil")}
                      >
                        Ir para o Meu Perfil
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Privacidade</h2>

                <div className="flex items-center justify-between gap-4 py-4 min-h-[4.5rem] border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Conta Privada</h4>
                    <p className="text-sm text-gray-500">
                      Apenas seguidores aprovados poderão ver seus posts.
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between gap-4 py-4 min-h-[4.5rem] border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Status Online</h4>
                    <p className="text-sm text-gray-500">
                      Mostrar quando você estiver ativo na Nexus.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Segurança</h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nova Senha
                    </label>
                    <Input
                      type="password"
                      placeholder="Digite sua nova senha"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confirmar Nova Senha
                    </label>
                    <Input
                      type="password"
                      placeholder="Repita a nova senha"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    className="!h-11 !min-h-[44px]"
                    onClick={handleUpdatePassword}
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? "Atualizando..." : "Atualizar Senha"}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Notificações</h2>

                <div className="flex items-center justify-between gap-4 py-4 min-h-[4.5rem] border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Notificações Push
                    </h4>
                    <p className="text-sm text-gray-500">Receba alertas no navegador ou celular.</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between gap-4 py-4 min-h-[4.5rem] border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      E-mails promocionais
                    </h4>
                    <p className="text-sm text-gray-500">Novidades e ofertas da Nexus.</p>
                  </div>
                  <Switch />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
