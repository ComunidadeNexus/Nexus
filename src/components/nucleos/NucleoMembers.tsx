import { useNavigate } from "react-router-dom";
import { Crown, Shield, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { NucleoMember } from "@/hooks/useNucleos";

interface NucleoMembersProps {
  members: NucleoMember[];
  maxDisplay?: number;
}

const roleConfig = {
  owner: { icon: Crown, label: "Dono", color: "text-yellow-500" },
  moderator: { icon: Shield, label: "Moderador", color: "text-blue-500" },
  member: { icon: User, label: "Membro", color: "text-muted-foreground" },
};

const NucleoMembers = ({ members, maxDisplay = 10 }: NucleoMembersProps) => {
  const navigate = useNavigate();
  const displayMembers = members.slice(0, maxDisplay);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          Membros ({members.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {displayMembers.map((member) => {
            const RoleIcon = roleConfig[member.role].icon;
            const profile = member.profile;

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/perfil/${member.user_id}`)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {profile?.name || "Usuário"}
                  </p>
                  {profile?.username && (
                    <p className="text-xs text-muted-foreground">
                      @{profile.username}
                    </p>
                  )}
                </div>
                <RoleIcon
                  className={`w-4 h-4 ${roleConfig[member.role].color}`}
                />
              </div>
            );
          })}
        </div>
        {members.length > maxDisplay && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            +{members.length - maxDisplay} outros membros
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default NucleoMembers;
