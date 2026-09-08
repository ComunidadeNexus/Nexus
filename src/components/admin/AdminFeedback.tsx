import { useEffect } from "react";
import { useFeedback } from "@/hooks/useFeedback";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Lightbulb, Loader2 } from "lucide-react";

export default function AdminFeedback() {
  const { feedbacks, isLoading, fetchFeedbacks, updateFeedbackStatus } = useFeedback();

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-500";
      case "reviewed":
        return "bg-blue-500/20 text-blue-500";
      case "implemented":
        return "bg-green-500/20 text-green-500";
      case "rejected":
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "reviewed":
        return "Em Análise";
      case "implemented":
        return "Implementado";
      case "rejected":
        return "Recusado";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Feedback & Dicas</h2>
        <p className="text-muted-foreground">
          Gerencie as sugestões enviadas pelos usuários da plataforma.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : feedbacks.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Lightbulb className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground">Nenhuma dica recebida ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {feedbacks.map((item) => (
            <Card key={item.id} className="glass-card bg-black/20 border-white/5">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={item.profile?.avatar_url || ""} />
                      <AvatarFallback>{item.profile?.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">
                          {item.profile?.name || "Usuário Desconhecido"}
                        </span>
                        {item.content.startsWith("[BUG] ") && (
                          <Badge variant="destructive" className="text-[10px] h-5 px-1.5 ml-1">
                            Bug / Erro
                          </Badge>
                        )}
                        {item.profile?.username && (
                          <span className="text-sm text-muted-foreground ml-1">
                            @{item.profile.username}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDistanceToNow(new Date(item.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap mt-2 bg-black/20 p-4 rounded-lg border border-white/5">
                        {item.content.startsWith("[BUG] ")
                          ? item.content.replace("[BUG] ", "")
                          : item.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-14 md:ml-0">
                    <Badge variant="outline" className={getStatusColor(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                    <Select
                      defaultValue={item.status}
                      onValueChange={(val: any) => updateFeedbackStatus(item.id, val)}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs bg-black/40 border-white/10">
                        <SelectValue placeholder="Mudar status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="reviewed">Em Análise</SelectItem>
                        <SelectItem value="implemented">Implementado</SelectItem>
                        <SelectItem value="rejected">Recusado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
