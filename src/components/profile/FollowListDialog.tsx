import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { ProfileName, UserAvatar } from "@/components/profile/ProfileLink";
import { formatFollowersLabel, formatFollowingLabel, profilePath } from "@/lib/profileSocial";

type Person = {
  id: string;
  userId: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
};

interface FollowListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tab: "followers" | "following";
  onTabChange: (tab: "followers" | "following") => void;
  userId: string;
  followersCount: number;
  followingCount: number;
}

const PersonRow = ({
  person,
  onClose,
}: {
  person: Person;
  onClose: () => void;
}) => {
  const href = profilePath(person.userId);
  if (!href) return null;
  return (
    <Link
      to={href}
      onClick={onClose}
      className="flex items-center gap-3 min-h-11 px-1 py-2 rounded-lg hover:bg-muted/60"
    >
      <UserAvatar
        userId={person.userId}
        name={person.name || person.username}
        avatarUrl={person.avatarUrl}
        className="w-9 h-9"
        link={false}
      />
      <span className="min-w-0">
        <ProfileName
          userId={person.userId}
          name={person.name || person.username}
          className="text-sm font-medium"
          link={false}
        />
        {person.username && (
          <p className="text-xs text-muted-foreground truncate">@{person.username}</p>
        )}
      </span>
    </Link>
  );
};

async function loadPeople(
  column: "following_id" | "follower_id",
  userId: string,
  profileIdField: "follower_id" | "following_id",
): Promise<Person[]> {
  const { data, error } = await supabase
    .from("followers")
    .select("*")
    .eq(column, userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!data || data.length === 0) return [];

  const ids = data.map((row) => row[profileIdField]);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, name, avatar_url, username")
    .in("user_id", ids);
  const profileMap = new Map((profiles || []).map((profile) => [profile.user_id, profile]));

  return data.flatMap((row) => {
    const targetId = row[profileIdField];
    const profile = profileMap.get(targetId);
    if (!targetId) return [];
    return [
      {
        id: row.id,
        userId: targetId,
        name: profile?.name ?? null,
        username: profile?.username ?? null,
        avatarUrl: profile?.avatar_url ?? null,
      },
    ];
  });
}

const FollowListDialog = ({
  open,
  onOpenChange,
  tab,
  onTabChange,
  userId,
  followersCount,
  followingCount,
}: FollowListDialogProps) => {
  const [followers, setFollowers] = useState<Person[]>([]);
  const [following, setFollowing] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || !userId) return;
    let cancelled = false;
    setIsLoading(true);
    Promise.all([
      loadPeople("following_id", userId, "follower_id"),
      loadPeople("follower_id", userId, "following_id"),
    ])
      .then(([nextFollowers, nextFollowing]) => {
        if (cancelled) return;
        setFollowers(nextFollowers);
        setFollowing(nextFollowing);
      })
      .catch((error) => {
        if (!cancelled) console.error("Error loading follow lists:", error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, userId]);

  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rede</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={(value) => onTabChange(value as "followers" | "following")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">{formatFollowersLabel(followersCount)}</TabsTrigger>
            <TabsTrigger value="following">{formatFollowingLabel(followingCount)}</TabsTrigger>
          </TabsList>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <TabsContent value="followers" className="max-h-80 overflow-y-auto mt-3 space-y-1">
                {followers.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    Nenhum seguidor ainda
                  </p>
                ) : (
                  followers.map((person) => (
                    <PersonRow key={person.id} person={person} onClose={close} />
                  ))
                )}
              </TabsContent>
              <TabsContent value="following" className="max-h-80 overflow-y-auto mt-3 space-y-1">
                {following.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    Não segue ninguém ainda
                  </p>
                ) : (
                  following.map((person) => (
                    <PersonRow key={person.id} person={person} onClose={close} />
                  ))
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FollowListDialog;
