import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import AppLayout from "@/components/layout/AppLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import AliasRedirect from "@/components/AliasRedirect";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Marketplace from "./pages/Marketplace";
import Nucleos from "./pages/Nucleos";
import NucleoDetail from "./pages/NucleoDetail";
import Notifications from "./pages/Notifications";
import NewListing from "./pages/NewListing";
import GlobalChat from "./pages/GlobalChat";
import HashtagExplore from "./pages/HashtagExplore";
import Subscription from "./pages/Subscription";
import PremiumArea from "./pages/PremiumArea";
import Install from "./pages/Install";
import Analytics from "./pages/Analytics";
import ProtectedRoute from "./components/ProtectedRoute";
import Configuracoes from "./pages/Configuracoes";
import Busca from "./pages/Busca";
import NotFound from "./pages/NotFound";
import Feed from "./pages/Feed";
import Noticias from "./pages/Noticias";
import NexusAcademy from "./pages/NexusAcademy";
import NexusGames from "./pages/NexusGames";
import AoVivo from "./pages/AoVivo";
import Regras from "./pages/Regras";
import Sobre from "./pages/Sobre";

// Admin Imports
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminMembros from "./components/admin/AdminMembros";
import AdminConteudo from "./components/admin/AdminConteudo";
import AdminCategorias from "./components/admin/AdminCategorias";
import AdminNucleos from "./components/admin/AdminNucleos";
import AdminMarketplace from "./components/admin/AdminMarketplace";
import AdminGamificacao from "./components/admin/AdminGamificacao";
import AdminCoins from "./components/admin/AdminCoins";
import AdminJogos from "./components/admin/AdminJogos";
import AdminChat from "./components/admin/AdminChat";
import AdminNotificacoes from "./components/admin/AdminNotificacoes";
import AdminAssinaturas from "./components/admin/AdminAssinaturas";
import AdminPremio from "./components/admin/AdminPremio";
import AdminFeedback from "./components/admin/AdminFeedback";
import AdminDenuncias from "./components/admin/AdminDenuncias";
import AdminLogs from "./components/admin/AdminLogs";
import AdminConfig from "./components/admin/AdminConfig";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ErrorBoundary>
              <Routes>
                {/* Rotas Públicas */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/assinatura" element={<Subscription />} />
                <Route path="/instalar" element={<Install />} />
                <Route path="/regras" element={<Regras />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/painel" element={<Navigate to="/admin" replace />} />
                <Route path="/painel-admin" element={<Navigate to="/admin" replace />} />

                {/* Admin precisa ficar fora do layout logado: o path="*" de lá engolia /admin */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="membros" element={<AdminMembros />} />
                  <Route path="conteudo" element={<AdminConteudo />} />
                  <Route path="chat" element={<AdminChat />} />
                  <Route path="categorias" element={<AdminCategorias />} />
                  <Route path="nucleos" element={<AdminNucleos />} />
                  <Route path="marketplace" element={<AdminMarketplace />} />
                  <Route path="gamificacao" element={<AdminGamificacao />} />
                  <Route path="coins" element={<AdminCoins />} />
                  <Route path="jogos" element={<AdminJogos />} />
                  <Route path="notificacoes" element={<AdminNotificacoes />} />
                  <Route path="assinaturas" element={<AdminAssinaturas />} />
                  <Route path="premio" element={<AdminPremio />} />
                  <Route path="feedback" element={<AdminFeedback />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="denuncias" element={<AdminDenuncias />} />
                  <Route path="logs" element={<AdminLogs />} />
                  <Route path="configuracoes" element={<AdminConfig />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </Route>

                {/* Rotas Logadas com Novo Layout Reddit */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/comunidade" element={<Feed />} />
                  <Route path="/popular" element={<Feed />} />
                  <Route path="/feed" element={<Feed />} />
                  <Route path="/perfil" element={<Profile />} />
                  <Route path="/perfil/:userId" element={<Profile />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="/busca" element={<Busca />} />
                  <Route path="/mensagens" element={<Messages />} />
                  <Route path="/mensagens/:conversationId" element={<Messages />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/marketplace/novo" element={<NewListing />} />
                  <Route path="/nucleos" element={<Nucleos />} />
                  <Route path="/nucleo/:slug" element={<NucleoDetail />} />
                  <Route path="/notificacoes" element={<Notifications />} />
                  <Route path="/noticias" element={<Noticias />} />
                  <Route path="/chat" element={<GlobalChat />} />
                  <Route path="/hashtag/:tag" element={<HashtagExplore />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/academy" element={<NexusAcademy />} />
                  <Route path="/games" element={<NexusGames />} />
                  <Route path="/ao-vivo" element={<AoVivo />} />
                  <Route path="/premium" element={<PremiumArea />} />

                  {/* Aliases EN / antigos / acentuados → rotas canônicas */}
                  <Route path="/messages" element={<AliasRedirect to="/mensagens" />} />
                  <Route
                    path="/messages/:conversationId"
                    element={<AliasRedirect to="/mensagens/:conversationId" />}
                  />
                  <Route path="/profile" element={<AliasRedirect to="/perfil" />} />
                  <Route path="/profile/:userId" element={<AliasRedirect to="/perfil/:userId" />} />
                  <Route path="/settings" element={<AliasRedirect to="/configuracoes" />} />
                  <Route path="/live" element={<AliasRedirect to="/ao-vivo" />} />
                  <Route path="/notifications" element={<AliasRedirect to="/notificacoes" />} />
                  <Route path="/news" element={<AliasRedirect to="/noticias" />} />
                  <Route path="/notícias" element={<AliasRedirect to="/noticias" />} />
                  <Route path="/núcleos" element={<AliasRedirect to="/nucleos" />} />
                  <Route path="/núcleo/:slug" element={<AliasRedirect to="/nucleo/:slug" />} />
                  <Route path="/notificações" element={<AliasRedirect to="/notificacoes" />} />
                  <Route path="/configurações" element={<AliasRedirect to="/configuracoes" />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
