import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Comunidade from "./pages/Comunidade";
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
import Install from "./pages/Install";
import Analytics from "./pages/Analytics";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/comunidade" element={<ProtectedRoute><Comunidade /></ProtectedRoute>} />
              <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/perfil/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/mensagens" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/mensagens/:conversationId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
              <Route path="/marketplace/novo" element={<ProtectedRoute><NewListing /></ProtectedRoute>} />
              <Route path="/nucleos" element={<ProtectedRoute><Nucleos /></ProtectedRoute>} />
              <Route path="/nucleo/:slug" element={<ProtectedRoute><NucleoDetail /></ProtectedRoute>} />
              <Route path="/notificacoes" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><GlobalChat /></ProtectedRoute>} />
              <Route path="/hashtag/:tag" element={<ProtectedRoute><HashtagExplore /></ProtectedRoute>} />
              <Route path="/assinatura" element={<Subscription />} />
              <Route path="/instalar" element={<Install />} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
