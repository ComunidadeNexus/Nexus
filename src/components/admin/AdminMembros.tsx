import { useState, useEffect } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import {
  Users,
  Search,
  Shield,
  Crown,
  Ban,
  Star,
  Coins,
  ChevronDown,
  Loader2,
  Filter,
  Download,
  Copy,
  KeyRound,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { UserAvatar, ProfileName } from "@/components/profile/ProfileLink";
import { formatIdentityLabel } from "@/lib/identity";

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  admin: { label: "Admin", className: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
  moderator: { label: "Moderador", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  premium: { label: "Premium", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  user: { label: "Usuário", className: "bg-white/10 text-muted-foreground border-white/10" },
};

const AdminMembros = () => {
  const {
    users,
    loadingUsers,
    fetchUsers,
    updateUserRole,
    grantPremium,
    revokePremium,
    toggleBanUser,
    toggleVerifyUser,
    grantXP,
    creditCoins,
    resetUserPassword,
  } = useAdminData();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterBanned, setFilterBanned] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [xpAmount, setXpAmount] = useState("100");
  const [coinsAmount, setCoinsAmount] = useState("50");
  const [coinsDesc, setCoinsDesc] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const selectedUser = users.find((u) => u.user_id === selectedUserId) ?? null;
  const selectedHasPremium =
    !!selectedUser &&
    ((selectedUser.roles || []).includes("premium") || selectedUser.role === "premium");

  useEffect(() => {
    fetchUsers(search, filterRole, filterBanned);
  }, []);

  useEffect(() => {
    setNewPassword("");
    setConfirmPassword("");
  }, [selectedUserId]);

  const handleSearch = () => fetchUsers(search, filterRole, filterBanned);

  const handleAction = async (fn: () => Promise<unknown>) => {
    setActionLoading(true);
    try {
      await fn();
    } finally {
      setActionLoading(false);
    }
  };

  const copyText = async (value: string, label: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: `${label} copiado` });
    } catch {
      toast({ title: "Não deu para copiar", variant: "destructive" });
    }
  };

  const exportToCSV = () => {
    if (!users.length) return;

    const headers = [
      "ID",
      "Email",
      "Nome",
      "Username",
      "Role",
      "CPF",
      "XP",
      "Coins",
      "Nivel",
      "Status",
      "Data Cadastro",
    ];
    const csvContent = [
      headers.join(","),
      ...users.map((u) =>
        [
          u.user_id,
          `"${(u.email || "").replace(/"/g, '""')}"`,
          `"${(u.name || "").replace(/"/g, '""')}"`,
          `"${(u.username || "").replace(/"/g, '""')}"`,
          u.role,
          `"${formatIdentityLabel(u.cpf_last4, u.identity_status).replace(/"/g, '""')}"`,
          u.xp_points,
          u.wallet_balance || 0,
          u.level,
          u.is_banned ? "Banido" : "Ativo",
          new Date(u.created_at).toLocaleDateString("pt-BR"),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `membros_nexus_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Membros</h1>
          <p className="text-sm text-muted-foreground">{users.length} membros carregados</p>
        </div>
        <div className="ml-auto">
          <Button onClick={exportToCSV} variant="outline" className="border-white/10 bg-white/5">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Buscar por nome ou username..."
            className="pl-9 bg-white/5 border-white/10"
          />
        </div>
        <Select
          value={filterRole}
          onValueChange={(v) => {
            setFilterRole(v === "all" ? "" : v);
          }}
        >
          <SelectTrigger className="w-40 bg-white/5 border-white/10">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderador</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="user">Usuário</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filterBanned}
          onValueChange={(v) => {
            setFilterBanned(v === "all" ? "" : v);
          }}
        >
          <SelectTrigger className="w-40 bg-white/5 border-white/10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="banned">Banidos</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} className="bg-violet-600 hover:bg-violet-700">
          <Search className="w-4 h-4 mr-2" /> Buscar
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Membro</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Role</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                  Nível / XP
                </th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Karma</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Coins</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">CPF</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Criado em</th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array(9)
                        .fill(0)
                        .map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <Skeleton className="h-8 rounded" />
                          </td>
                        ))}
                    </tr>
                  ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-muted-foreground py-12">
                    Nenhum membro encontrado
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const roleConf = ROLE_CONFIG[user.role || "user"];
                  return (
                    <tr
                      key={user.user_id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setSelectedUserId(user.user_id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            userId={user.user_id}
                            name={user.name || user.username}
                            avatarUrl={user.avatar_url}
                            className="w-8 h-8"
                            fallbackClassName="bg-gradient-to-br from-violet-500 to-purple-700 text-xs font-bold text-white"
                          />
                          <div>
                            <p className="font-medium text-foreground">
                              <ProfileName
                                userId={user.user_id}
                                name={user.name || "Sem nome"}
                                isVerified={user.is_verified}
                                className="font-medium"
                              />
                            </p>
                            <p className="text-xs text-muted-foreground">@{user.username || "—"}</p>
                            {user.email && (
                              <p className="text-[11px] text-muted-foreground/80 truncate max-w-[180px]">
                                {user.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-1">
                          <Badge className={`text-xs ${roleConf.className}`}>
                            {roleConf.label}
                          </Badge>
                          {(user.roles || []).includes("premium") && user.role !== "premium" && (
                            <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              Premium
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-foreground">Lv.{user.level}</span>
                        <span className="text-muted-foreground text-xs ml-1">
                          ({user.xp_points} XP)
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground">{user.karma}</td>
                      <td className="px-4 py-3">
                        <span className="text-amber-400 font-medium">
                          {user.wallet_balance || 0}
                        </span>
                        <span className="text-muted-foreground text-xs ml-1">coins</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {formatIdentityLabel(user.cpf_last4, user.identity_status)}
                      </td>
                      <td className="px-4 py-3">
                        {user.is_banned ? (
                          <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                            Banido
                          </Badge>
                        ) : (
                          <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            Ativo
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/10 hover:bg-white/10 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUserId(user.user_id);
                          }}
                        >
                          Gerenciar
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <DialogContent className="flex max-h-[min(90dvh,52rem)] w-[calc(100%-1.5rem)] max-w-lg flex-col gap-0 overflow-hidden p-0 bg-background/95 backdrop-blur border-white/10">
          {selectedUser && (
            <>
              <DialogHeader className="shrink-0 space-y-1 px-6 pb-3 pt-6 text-left">
                <DialogTitle className="flex items-center gap-3">
                  <UserAvatar
                    userId={selectedUser.user_id}
                    name={selectedUser.name || selectedUser.username}
                    avatarUrl={selectedUser.avatar_url}
                    className="w-10 h-10"
                    fallbackClassName="bg-gradient-to-br from-violet-500 to-purple-700 text-sm font-bold text-white"
                  />
                  <div>
                    <ProfileName
                      userId={selectedUser.user_id}
                      name={selectedUser.name || selectedUser.username || "Sem nome"}
                      isVerified={selectedUser.is_verified}
                    />
                    <p className="text-xs text-muted-foreground font-normal">
                      @{selectedUser.username || "—"}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-2">
                <div className="space-y-5 py-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                    <p className="text-sm font-medium text-foreground">Login</p>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">Email</p>
                        <p className="text-sm text-foreground truncate">
                          {selectedUser.email || "—"}
                        </p>
                      </div>
                      {selectedUser.email && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="shrink-0"
                          onClick={() => copyText(selectedUser.email || "", "Email")}
                          aria-label="Copiar email"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">Username</p>
                        <p className="text-sm text-foreground truncate">
                          @{selectedUser.username || "—"}
                        </p>
                      </div>
                      {selectedUser.username && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="shrink-0"
                          onClick={() => copyText(selectedUser.username || "", "Username")}
                          aria-label="Copiar username"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">CPF</p>
                        <p className="text-sm text-foreground truncate">
                          {formatIdentityLabel(selectedUser.cpf_last4, selectedUser.identity_status)}
                        </p>
                      </div>
                    </div>
                    {selectedUser.last_sign_in_at && (
                      <p className="text-xs text-muted-foreground">
                        Último acesso:{" "}
                        {format(new Date(selectedUser.last_sign_in_at), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      A senha antiga não aparece. Digite uma senha nova para este usuário poder
                      entrar.
                    </p>
                    <Input
                      type="password"
                      placeholder="Senha nova (mín. 6 caracteres)"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Input
                      type="password"
                      placeholder="Confirmar senha nova"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      className="w-full border-white/10"
                      disabled={actionLoading || !newPassword || !confirmPassword}
                      onClick={() => {
                        if (newPassword !== confirmPassword) {
                          toast({ title: "As senhas não coincidem", variant: "destructive" });
                          return;
                        }
                        handleAction(async () => {
                          const ok = await resetUserPassword(selectedUser.user_id, newPassword);
                          if (ok) {
                            setNewPassword("");
                            setConfirmPassword("");
                          }
                        });
                      }}
                    >
                      <KeyRound className="w-4 h-4 mr-2" />
                      Redefinir senha
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Nível", value: selectedUser.level },
                      { label: "XP", value: selectedUser.xp_points },
                      { label: "Karma", value: selectedUser.karma },
                      { label: "Seguidores", value: selectedUser.followers_count },
                      { label: "Seguindo", value: selectedUser.following_count },
                      { label: "Coins", value: selectedUser.wallet_balance || 0 },
                    ].map((s) => (
                      <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-foreground">{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Acesso Premium</label>
                    {selectedHasPremium ? (
                      <Button
                        className="w-full border-yellow-500/40 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                        variant="outline"
                        onClick={() => handleAction(() => revokePremium(selectedUser.user_id))}
                        disabled={actionLoading}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Remover acesso Premium
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                        onClick={() => handleAction(() => grantPremium(selectedUser.user_id))}
                        disabled={actionLoading}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Dar acesso Premium
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Libera o cofre em /premium para este usuário, sem precisar assinar.
                    </p>
                  </div>

                  {/* Change Role */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Alterar Role</label>
                    <div className="flex gap-2 flex-wrap">
                      {["user", "moderator", "admin"].map((role) => (
                        <button
                          key={role}
                          onClick={() =>
                            handleAction(() => updateUserRole(selectedUser.user_id, role))
                          }
                          className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                            selectedUser.role === role
                              ? "bg-violet-500/20 border-violet-500/50 text-violet-400"
                              : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
                          }`}
                        >
                          {ROLE_CONFIG[role]?.label || role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grant XP */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Conceder XP</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={xpAmount}
                        onChange={(e) => setXpAmount(e.target.value)}
                        className="bg-white/5 border-white/10"
                        placeholder="Quantidade de XP"
                      />
                      <Button
                        onClick={() =>
                          handleAction(() => grantXP(selectedUser.user_id, Number(xpAmount)))
                        }
                        className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
                        disabled={actionLoading}
                      >
                        <Star className="w-4 h-4 mr-1" /> Dar XP
                      </Button>
                    </div>
                  </div>

                  {/* Credit Coins */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Creditar Coins</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={coinsAmount}
                        onChange={(e) => setCoinsAmount(e.target.value)}
                        className="bg-white/5 border-white/10"
                        placeholder="Coins"
                      />
                      <Button
                        onClick={() =>
                          handleAction(() =>
                            creditCoins(
                              selectedUser.user_id,
                              Number(coinsAmount),
                              coinsDesc || "Crédito pelo admin",
                            ),
                          )
                        }
                        className="bg-amber-600 hover:bg-amber-700 shrink-0"
                        disabled={actionLoading}
                      >
                        <Coins className="w-4 h-4 mr-1" /> Creditar
                      </Button>
                    </div>
                    <Input
                      value={coinsDesc}
                      onChange={(e) => setCoinsDesc(e.target.value)}
                      className="bg-white/5 border-white/10"
                      placeholder="Motivo (opcional)"
                    />
                  </div>

                  {/* Ban / Verify */}
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Selo verificado</p>
                      <p className="text-xs text-muted-foreground">
                        Apenas admins podem marcar ou desmarcar.
                      </p>
                    </div>
                    <Switch
                      checked={selectedUser.is_verified}
                      onCheckedChange={() =>
                        handleAction(() =>
                          toggleVerifyUser(selectedUser.user_id, selectedUser.is_verified),
                        )
                      }
                      disabled={actionLoading}
                      aria-label="Alternar verificação"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className={`flex-1 ${
                        selectedUser.is_banned
                          ? "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                          : "border-red-500/50 text-red-400 hover:bg-red-500/10"
                      }`}
                      onClick={() =>
                        handleAction(() =>
                          toggleBanUser(selectedUser.user_id, selectedUser.is_banned),
                        )
                      }
                      disabled={actionLoading}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      {selectedUser.is_banned ? "Desbanir" : "Banir Usuário"}
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter className="shrink-0 border-t border-white/10 px-6 py-4">
                <Button variant="ghost" onClick={() => setSelectedUserId(null)}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMembros;
