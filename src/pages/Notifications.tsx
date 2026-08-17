import Navbar from "@/components/Navbar";
import BottomNavigation from "@/components/BottomNavigation";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import { Bell, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const { notifications, unreadCount, isLoading, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    if (notification.post_id) {
      navigate(`/comunidade`);
    } else if (notification.type === "follow" && notification.actor_id) {
      navigate(`/perfil/${notification.actor_id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-20 pb-12 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Notificações</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {unreadCount} não lida{unreadCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhuma notificação</h3>
            <p className="text-muted-foreground">
              Você será notificado quando alguém interagir com seu conteúdo.
            </p>
          </div>
        ) : (
          <div className="glass-card rounded-xl divide-y divide-border overflow-hidden">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
              >
                <NotificationItem notification={notification} showFull />
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Notifications;
