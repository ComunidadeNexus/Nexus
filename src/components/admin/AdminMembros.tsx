import { useState, useEffect } from "react";
import { useAdminData, AdminUser } from "@/hooks/useAdminData";
import { Users, Search, Shield, Crown, Ban, BadgeCheck, Star, Coins, ChevronDown, Loader2, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  admin: { label: "Admin", className: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
  moderator: { label: "Moderador", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  premium: { label: "Premium", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  user: { label: "Usuário", className: "bg-white/10 text-muted-foreground border-white/10" },
};

const AdminMembros = () => {
  const { users, loadingUsers, fetchUsers, updateUserRole, toggleBanUser, toggleVerifyUser, grantXP, creditCoins } = useAdminData();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterBanned, setFilterBanned] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [xpAmount, setXpAmount] = useState("100");
  const [coinsAmount, setCoinsAmount] = useState("50");
  const [coinsDesc, setCoinsDesc] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchUsers(search, filterRole, filterBanned); }, []);

  const handleSearch = () => fetchUsers(search, filterRole, filterBanned);

  const handleAction = async (fn: () => Promise<void>) => {
    setActionLoading(true);
    await fn();
    setActionLoading(false);
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
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Buscar por nome ou username..."
            className="pl-9 bg-white/5 border-white/10"
          />
        </div>
        <Select value={filterRole} onValueChange={v => { setFilterRole(v === "all" ? "" : v); }}>
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
        <Select value={filterBanned} onValueChange={v => { setFilterBanned(v === "all" ? "" : v); }}>
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
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Nível / XP</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Karma</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Coins</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Criado em</th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array(8).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-8 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted-foreground py-12">
                    Nenhum membro encontrado
                  </td>
                </tr>
              ) : users.map(user => {
                const roleConf = ROLE_CONFIG[user.role || "user"];
                return (
                  <tr key={user.user_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            (user.name || user.username || "?")[0]?.toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name || "Sem nome"}</p>
                          <p className="text-xs text-muted-foreground">@{user.username || "—"}</p>
                        </div>
                        {user.is_verified && <BadgeCheck className="w-4 h-4 text-sky-400 shrink-0" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`text-xs ${roleConf.className}`}>{roleConf.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-foreground">Lv.{user.level}</span>
                      <span className="text-muted-foreground text-xs ml-1">({user.xp_points} XP)</span>
                    </td>
                    <td className="px-4 py-3 text-foreground">{user.karma}</td>
                    <td className="px-4 py-3">
                      <span className="text-amber-400 font-medium">{user.wallet_balance || 0}</span>
                      <span className="text-muted-foreground text-xs ml-1">coins</span>
                    </td>
                    <td className="px-4 py-3">
                      {user.is_banned ? (
                        <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">Banido</Badge>
                      ) : (
                        <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Ativo</Badge>
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
                        onClick={() => setSelectedUser(user)}
                      >
                        Gerenciar
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={open => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-lg bg-background/95 backdrop-blur border-white/10">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-sm font-bold text-white overflow-hidden">
                    {selectedUser.avatar_url ? (
                      <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (selectedUser.name || selectedUser.username || "?")[0]?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <p>{selectedUser.name || selectedUser.username || "Sem nome"}</p>
                    <p className="text-xs text-muted-foreground font-normal">@{selectedUser.username || "—"}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 py-2">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Nível", value: selectedUser.level },
                    { label: "XP", value: selectedUser.xp_points },
                    { label: "Karma", value: selectedUser.karma },
                    { label: "Seguidores", value: selectedUser.followers_count },
                    { label: "Seguindo", value: selectedUser.following_count },
                    { label: "Coins", value: selectedUser.wallet_balance || 0 },
                  ].map(s => (
                    <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Change Role */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Alterar Role</label>
                  <div className="flex gap-2 flex-wrap">
                    {["user", "premium", "moderator", "admin"].map(role => (
                      <button
                        key={role}
                        onClick={() => handleAction(() => updateUserRole(selectedUser.user_id, role))}
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
                      onChange={e => setXpAmount(e.target.value)}
                      className="bg-white/5 border-white/10"
                      placeholder="Quantidade de XP"
                    />
                    <Button
                      onClick={() => handleAction(() => grantXP(selectedUser.user_id, Number(xpAmount)))}
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
                      onChange={e => setCoinsAmount(e.target.value)}
                      className="bg-white/5 border-white/10"
                      placeholder="Coins"
                    />
                    <Button
                      onClick={() => handleAction(() => creditCoins(selectedUser.user_id, Number(coinsAmount), coinsDesc || "Crédito pelo admin"))}
                      className="bg-amber-600 hover:bg-amber-700 shrink-0"
                      disabled={actionLoading}
                    >
                      <Coins className="w-4 h-4 mr-1" /> Creditar
                    </Button>
                  </div>
                  <Input
                    value={coinsDesc}
                    onChange={e => setCoinsDesc(e.target.value)}
                    className="bg-white/5 border-white/10"
                    placeholder="Motivo (opcional)"
                  />
                </div>

                {/* Ban / Verify */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className={`flex-1 ${selectedUser.is_verified
                      ? "border-sky-500/50 text-sky-400 hover:bg-sky-500/10"
                      : "border-white/10 text-muted-foreground hover:border-sky-500/50 hover:text-sky-400"
                    }`}
                    onClick={() => handleAction(() => toggleVerifyUser(selectedUser.user_id, selectedUser.is_verified))}
                    disabled={actionLoading}
                  >
                    <BadgeCheck className="w-4 h-4 mr-2" />
                    {selectedUser.is_verified ? "Remover Verificação" : "Verificar"}
                  </Button>
                  <Button
                    variant="outline"
                    className={`flex-1 ${selectedUser.is_banned
                      ? "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                      : "border-red-500/50 text-red-400 hover:bg-red-500/10"
                    }`}
                    onClick={() => handleAction(() => toggleBanUser(selectedUser.user_id, selectedUser.is_banned))}
                    disabled={actionLoading}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    {selectedUser.is_banned ? "Desbanir" : "Banir Usuário"}
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setSelectedUser(null)}>Fechar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMembros;
