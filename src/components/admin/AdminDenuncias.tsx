import { useEffect } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import { ShieldAlert, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminDenuncias = () => {
  const { reports, fetchReports, updateReportStatus } = useAdminData();

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            Central de Denúncias
          </h2>
          <p className="text-gray-400 mt-1">Gerencie os reports enviados pelos usuários.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports.length === 0 ? (
          <div className="text-center py-10">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-gray-400">Nenhuma denúncia pendente! Tudo tranquilo por aqui.</p>
          </div>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="bg-[#1a1f2e] border-gray-800">
              <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={report.status === "pending" ? "destructive" : "secondary"}>
                      {report.status === "pending"
                        ? "Pendente"
                        : report.status === "resolved"
                          ? "Resolvido"
                          : "Ignorado"}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {format(new Date(report.created_at), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-white mt-2">
                    <strong>Motivo:</strong> {report.reason}
                  </p>
                  <p className="text-sm text-gray-400">
                    Alvo:{" "}
                    {report.reported_user_id
                      ? "Usuário"
                      : report.reported_post_id
                        ? "Post"
                        : "Comentário"}
                  </p>
                </div>

                {report.status === "pending" && (
                  <div className="flex gap-2 items-start">
                    <Button
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      onClick={() => updateReportStatus(report.id, "dismissed")}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Ignorar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updateReportStatus(report.id, "resolved")}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolver
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDenuncias;
