import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { profilePath } from "@/lib/profileSocial";

type UserAvatarProps = {
  userId?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
  /** When false, render the avatar without navigation (current-user menus, etc.). */
  link?: boolean;
};

export function UserAvatar({
  userId,
  name,
  avatarUrl,
  className,
  fallbackClassName,
  link = true,
}: UserAvatarProps) {
  const displayName = name?.trim() || "Usuário";
  const avatar = (
    <Avatar
      className={cn("shrink-0", userId && link && "hover:opacity-80 transition-opacity", className)}
    >
      <AvatarImage src={avatarUrl || undefined} alt={displayName} className="object-cover" />
      <AvatarFallback className={fallbackClassName}>
        {displayName.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );

  const href = link ? profilePath(userId) : null;
  if (!href) return avatar;

  return (
    <Link
      to={href}
      className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`Ver perfil de ${displayName}`}
      onClick={(event) => event.stopPropagation()}
    >
      {avatar}
    </Link>
  );
}

type ProfileNameProps = {
  userId?: string | null;
  name?: string | null;
  isVerified?: boolean;
  className?: string;
  badgeClassName?: string;
  link?: boolean;
};

export function ProfileName({
  userId,
  name,
  isVerified = false,
  className,
  badgeClassName,
  link = true,
}: ProfileNameProps) {
  const displayName = name?.trim() || "Usuário";
  const inner = (
    <span className={cn("inline-flex items-center gap-1 min-w-0 max-w-full", className)}>
      <span className="truncate">{displayName}</span>
      {isVerified ? (
        <BadgeCheck
          className={cn("w-4 h-4 text-sky-400 shrink-0", badgeClassName)}
          aria-label="Verificado"
        />
      ) : null}
    </span>
  );

  const href = link ? profilePath(userId) : null;
  if (!href) return inner;

  return (
    <Link
      to={href}
      className="hover:underline min-w-0 max-w-full"
      onClick={(event) => event.stopPropagation()}
    >
      {inner}
    </Link>
  );
}
