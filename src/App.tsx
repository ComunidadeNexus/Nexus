import { lazy, Suspense, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import AppLayout from "@/components/layout/AppLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import AliasRedirect from "@/components/AliasRedirect";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Feed from "./pages/Feed";
import AdminLayout from "./components/layout/AdminLayout";

const Profile = lazy(() => import("./pages/Profile"));
const Messages = lazy(() => import("./pages/Messages"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Nucleos = lazy(() => import("./pages/Nucleos"));
const NucleoDetail = lazy(() => import("./pages/NucleoDetail"));
const Notifications = lazy(() => import("./pages/Notifications"));
const NewListing = lazy(() => import("./pages/NewListing"));
const MarketplaceListing = lazy(() => import("./pages/MarketplaceListing"));
const GlobalChat = lazy(() => import("./pages/GlobalChat"));
const HashtagExplore = lazy(() => import("./pages/HashtagExplore"));
const Subscription = lazy(() => import("./pages/Subscription"));
const PremiumArea = lazy(() => import("./pages/PremiumArea"));
const Install = lazy(() => import("./pages/Install"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const Busca = lazy(() => import("./pages/Busca"));
const Noticias = lazy(() => import("./pages/Noticias"));
const NexusAcademy = lazy(() => import("./pages/NexusAcademy"));
const NexusGames = lazy(() => import("./pages/NexusGames"));
const AoVivo = lazy(() => import("./pages/AoVivo"));
const Regras = lazy(() => import("./pages/Regras"));
const Sobre = lazy(() => import("./pages/Sobre"));
const VerificarIdentidade = lazy(() => import("./pages/VerificarIdentidade"));
const Produtos = lazy(() => import("./pages/Produtos"));
const ProducerLayout = lazy(() => import("./pages/producer/ProducerLayout"));
const ProducerOverview = lazy(() => import("./pages/producer/ProducerOverview"));
const ProducerProducts = lazy(() => import("./pages/producer/ProducerProducts"));
const ProducerSales = lazy(() => import("./pages/producer/ProducerSales"));
const ProducerCustomers = lazy(() => import("./pages/producer/ProducerCustomers"));
const ProducerFinance = lazy(() => import("./pages/producer/ProducerFinance"));
const ProducerSubscriptions = lazy(() => import("./pages/producer/ProducerSubscriptions"));
const ProducerSettings = lazy(() => import("./pages/producer/ProducerSettings"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const AdminMembros = lazy(() => import("./components/admin/AdminMembros"));
const AdminConteudo = lazy(() => import("./components/admin/AdminConteudo"));
const AdminCategorias = lazy(() => import("./components/admin/AdminCategorias"));
const AdminNucleos = lazy(() => import("./components/admin/AdminNucleos"));
const AdminMarketplace = lazy(() => import("./components/admin/AdminMarketplace"));
const AdminGamificacao = lazy(() => import("./components/admin/AdminGamificacao"));
const AdminCoins = lazy(() => import("./components/admin/AdminCoins"));
const AdminJogos = lazy(() => import("./components/admin/AdminJogos"));
const AdminChat = lazy(() => import("./components/admin/AdminChat"));
const AdminNotificacoes = lazy(() => import("./components/admin/AdminNotificacoes"));
const AdminAssinaturas = lazy(() => import("./components/admin/AdminAssinaturas"));
const AdminPremio = lazy(() => import("./components/admin/AdminPremio"));
const AdminFeedback = lazy(() => import("./components/admin/AdminFeedback"));
const AdminDenuncias = lazy(() => import("./components/admin/AdminDenuncias"));
const AdminLogs = lazy(() => import("./components/admin/AdminLogs"));
const AdminConfig = lazy(() => import("./components/admin/AdminConfig"));
const AdminCakto = lazy(() => import("./components/admin/AdminCakto"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20_000,
      retry: 1,
    },
  },
});

const PageFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Carregando" />
  </div>
);

const RoutedErrorBoundary = ({ children }: { children: ReactNode }) => {
  const { pathname, search } = useLocation();
  return <ErrorBoundary resetKey={`${pathname}${search}`}>{children}</ErrorBoundary>;
};

const AppRoutes = () => {
  const { user, signingOut } = useAuth();
  const routeKey = signingOut ? "signed-out" : (user?.id ?? "guest");

  return (
    <Routes key={routeKey}>
      {/* Rotas Públicas */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/assinatura" element={<Subscription />} />
      <Route path="/instalar" element={<Install />} />
      <Route path="/regras" element={<Regras />} />
      <Route path="/sobre" element={<Sobre />} />
      <Route
        path="/verificar-identidade"
        element={
          <ProtectedRoute allowUnverified>
            <VerificarIdentidade />
          </ProtectedRoute>
        }
      />
      <Route path="/painel" element={<Navigate to="/admin" replace />} />
      <Route path="/painel-admin" element={<Navigate to="/admin" replace />} />

      {/* Admin precisa ficar fora do layout logado: o path="*" de lá engolia /admin */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="membros" element={<AdminMembros />} />
        <Route path="conteudo" element={<AdminConteudo />} />
        <Route path="moderacao" element={<Navigate to="/admin/conteudo" replace />} />
        <Route path="moderation" element={<Navigate to="/admin/conteudo" replace />} />
        <Route path="chat" element={<AdminChat />} />
        <Route path="categorias" element={<AdminCategorias />} />
        <Route path="nucleos" element={<AdminNucleos />} />
        <Route path="marketplace" element={<AdminMarketplace />} />
        <Route path="gamificacao" element={<AdminGamificacao />} />
        <Route path="coins" element={<AdminCoins />} />
        <Route path="jogos" element={<AdminJogos />} />
        <Route path="notificacoes" element={<AdminNotificacoes />} />
        <Route path="assinaturas" element={<AdminAssinaturas />} />
        <Route path="cakto" element={<AdminCakto />} />
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
        <Route path="/marketplace/:listingId" element={<MarketplaceListing />} />
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
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/produtos/:productId" element={<Navigate to="/produtos" replace />} />
        <Route path="/comecar-a-vender" element={<Navigate to="/marketplace" replace />} />
        <Route path="/produtor" element={<ProducerLayout />}>
          <Route index element={<ProducerOverview />} />
          <Route path="produtos" element={<ProducerProducts />} />
          <Route path="vendas" element={<ProducerSales />} />
          <Route path="clientes" element={<ProducerCustomers />} />
          <Route path="financeiro" element={<ProducerFinance />} />
          <Route path="assinaturas" element={<ProducerSubscriptions />} />
          <Route path="configuracoes" element={<ProducerSettings />} />
        </Route>

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
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <RoutedErrorBoundary>
              <Suspense fallback={<PageFallback />}>
                <AppRoutes />
              </Suspense>
            </RoutedErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
