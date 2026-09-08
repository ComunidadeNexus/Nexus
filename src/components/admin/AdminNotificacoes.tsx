import { useState } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import { Bell, Send, Users, Crown, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TARGET_OPTIONS = [
  {
    value: "all",
    label: "Todos os usuários",
    icon: Users,
    desc: "Envia para todos os membros cadastrados",
  },
  { value: "premium", label: "Usuários Premium", icon: Crown, desc: "Somente assinantes premium" },
  { value: "moderator", label: "Moderadores", icon: Shield, desc: "Usuários com role moderador" },
  { value: "admin", label: "Administradores", icon: Shield, desc: "Somente admins" },
];

const AdminNotificacoes = () => {
  const { sendMassNotification } = useAdminData();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!title.trim()) return;
    setSending(true);
    await sendMassNotification(title, message, target);
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setTitle("");
    setMessage("");
  };

  const selectedTarget = TARGET_OPTIONS.find((t) => t.value === target);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notificações em Massa</h1>
          <p className="text-sm text-muted-foreground">Envie comunicados para grupos de usuários</p>
        </div>
      </div>

      <div className="max-w-xl">
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-5">
          {/* Target Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Destinatários</Label>
            <div className="grid grid-cols-2 gap-3">
              {TARGET_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = target === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTarget(opt.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-violet-500/50 bg-violet-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon
                        className={`w-4 h-4 ${isSelected ? "text-violet-400" : "text-muted-foreground"}`}
                      />
                      <span
                        className={`text-sm font-medium ${isSelected ? "text-violet-400" : "text-foreground"}`}
                      >
                        {opt.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label>Título da Notificação *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Novidade importante na plataforma!"
              className="bg-white/5 border-white/10"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/100</p>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label>Mensagem</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Detalhes da notificação (opcional)..."
              className="bg-white/5 border-white/10 resize-none h-28"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{message.length}/500</p>
          </div>

          {/* Preview */}
          {title && (
            <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/5">
              <p className="text-xs text-violet-400 font-medium mb-2">📋 Pré-visualização</p>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  {message && <p className="text-xs text-muted-foreground mt-0.5">{message}</p>}
                  <p className="text-xs text-violet-400/70 mt-1">Para: {selectedTarget?.label}</p>
                </div>
              </div>
            </div>
          )}

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!title.trim() || sending}
            className={`w-full transition-all ${
              sent
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            }`}
          >
            {sending ? (
              <>Enviando...</>
            ) : sent ? (
              <>✓ Notificação Enviada!</>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> Enviar Notificação
              </>
            )}
          </Button>
        </div>

        {/* Info Card */}
        <div className="mt-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <p className="text-xs text-amber-400/80">
            ⚠️ <strong>Atenção:</strong> Notificações em massa são enviadas imediatamente para todos
            os destinatários selecionados e não podem ser desfeitas. Use com moderação.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificacoes;
