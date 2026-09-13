import { useEffect } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import { Activity, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminLogs = () => {
  const { auditLogs, fetchAuditLogs } = useAdminData();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="w-8 h-8 text-blue-500" />
            Logs de Auditoria
          </h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe todas as ações realizadas pelos administradores.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {auditLogs.length === 0 ? (
          <div className="text-center py-10">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhum log registrado ainda.</p>
          </div>
        ) : (
          auditLogs.map((log) => (
            <Card key={log.id} className="bg-card border-border">
              <CardContent className="p-4 flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {log.action}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">
                    Admin ID: <span className="font-mono text-xs">{log.admin_id}</span>
                  </p>
                  {log.target_id && (
                    <p className="text-sm text-muted-foreground">
                      Target ID: <span className="font-mono text-xs">{log.target_id}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
