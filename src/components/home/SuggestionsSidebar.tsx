import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Profile {
  user_id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

const SuggestionsSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      // Fetch current user profile
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id, name, username, avatar_url, is_verified")
          .eq("user_id", user.id)
          .single();
        
        if (profile) {
          setCurrentUserProfile(profile);
        }
      }

      // Fetch random profiles for suggestions
      const { data } = await supabase
        .from("profiles")
        .select("user_id, name, username, avatar_url, is_verified")
        .neq("user_id", user?.id || "")
        .limit(5);

      if (data) {
        setSuggestions(data);
      }
    };

    fetchProfiles();
  }, [user]);

  return (
    <aside className="hidden lg:block w-80 pl-8 py-4 space-y-6">
      {/* Current User */}
      {currentUserProfile && (
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/perfil")}
        >
          <img
            src={currentUserProfile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserProfile.name}`}
            alt={currentUserProfile.name || "User"}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              {currentUserProfile.name || "Usuário"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              @{currentUserProfile.username || "user"}
            </p>
          </div>
          <Button variant="link" size="sm" className="text-primary text-xs">
            Trocar
          </Button>
        </div>
      )}

      {/* Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Sugestões para Você
          </h3>
          <Button variant="link" size="sm" className="text-xs p-0 h-auto">
            Ver Tudo
          </Button>
        </div>

        <div className="space-y-3">
          {suggestions.map((profile) => (
            <div
              key={profile.user_id}
              className="flex items-center gap-3"
            >
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`}
                alt={profile.name || "User"}
                className="w-10 h-10 rounded-full object-cover cursor-pointer"
                onClick={() => navigate(`/perfil/${profile.user_id}`)}
              />
              <div 
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => navigate(`/perfil/${profile.user_id}`)}
              >
                <p className="font-semibold text-sm truncate flex items-center gap-1">
                  {profile.name || "Usuário"}
                  {profile.is_verified && (
                    <span className="text-primary">✓</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  @{profile.username || "user"}
                </p>
              </div>
              <Button variant="link" size="sm" className="text-primary text-xs p-0">
                Seguir
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Links */}
      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground/60">
          Sobre • Ajuda • Imprensa • API • Carreiras • Privacidade • Termos
        </p>
        <p className="text-xs text-muted-foreground/40 mt-2">
          © 2025 Comunidade
        </p>
      </div>
    </aside>
  );
};

export default SuggestionsSidebar;
