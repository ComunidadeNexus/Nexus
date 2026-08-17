import { Heart, MessageCircle, UserPlus, AtSign, Award, TrendingUp, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationItemProps {
  notification: Notification;
  showFull?: boolean;
}

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "like":
      return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
    case "comment":
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case "follow":
      return <UserPlus className="w-4 h-4 text-green-500" />;
    case "mention":
      return <AtSign className="w-4 h-4 text-purple-500" />;
    case "badge":
      return <Award className="w-4 h-4 text-yellow-500" />;
    case "level_up":
      return <TrendingUp className="w-4 h-4 text-cyan-500" />;
    default:
      return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
};

const NotificationItem = ({ notification, showFull = false }: NotificationItemProps) => {
  const { markAsRead } = useNotifications();
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  const handleClick = () => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  const initials = notification.actor?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 p-3 transition-colors cursor-pointer",
        !notification.is_read && "bg-primary/5",
        showFull && "hover:bg-accent rounded-lg"
      )}
    >
      <div className="relative">
        <Avatar className="w-10 h-10">
          <AvatarImage src={notification.actor?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/20 text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-full flex items-center justify-center">
          {getNotificationIcon(notification.type)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", !notification.is_read && "font-medium")}>
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-sm text-muted-foreground truncate">
            {notification.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
      </div>
      {!notification.is_read && (
        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
      )}
    </div>
  );
};

export default NotificationItem;
