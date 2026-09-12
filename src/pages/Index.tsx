import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Zap, MessageSquare, Trophy, Network, ArrowRight, Loader2, Smartphone } from "lucide-react";

const Index = () => {
  const { user, loading, signingOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && !signingOut) {
      navigate("/comunidade");
    }
  }, [user, loading, signingOut, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050810]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050810] text-white font-sans overflow-x-hidden relative">
      {/* Tech Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Abstract Background Blobs (Using Nexus Brand Colors) */}
      <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[120%] bg-primary/10 blur-[150px] rounded-full mix-blend-screen transform -rotate-12" />
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[120%] bg-secondary/10 blur-[150px] rounded-full mix-blend-screen transform rotate-12" />
      </div>

      {/* Navbar */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl z-50">
        <div className="flex items-center justify-between px-6 py-3 rounded-[2rem] bg-[#1A1D24]/40 border border-white/5 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl tracking-wide gradient-text">
              Nexus
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/auth")}
              className="text-sm font-medium text-gray-300 hover:text-white transition"
            >
              Entrar
            </button>
            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="text-sm font-bold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all"
            >
              Criar Conta
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-48 pb-20 px-4 text-center min-h-[75vh]">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#111827]/80 border border-emerald-500/30 text-sm font-medium text-gray-300 mb-10 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          A maior comunidade tech está online
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-[5rem] lg:text-[5.5rem] font-extrabold tracking-tight leading-[1.1] mb-8">
          <span className="gradient-text block mb-2">Nexus: Onde tudo se conecta.</span>
          <span className="text-gray-100">Bem-vindo ao lar </span>
          <span className="gradient-text">digital.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl font-light">
          Conecte-se com milhares de criadores, participe de fóruns técnicos, suba de nível
          completando desafios e monetize suas habilidades.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <button
            onClick={() => navigate("/auth?mode=signup")}
            className="group flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-primary/10 border border-primary/50 text-white font-medium text-lg hover:bg-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.2)] transition-all backdrop-blur-sm w-full sm:w-auto"
          >
            Começar agora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="px-8 py-4 rounded-full bg-[#1A1D24]/50 border border-gray-600/50 text-gray-200 font-medium text-lg hover:bg-white/5 transition-all w-full sm:w-auto"
          >
            Já tenho uma conta
          </button>
          <button
            onClick={() => navigate("/instalar")}
            className="px-8 py-4 rounded-full border border-primary/40 text-primary font-medium text-lg hover:bg-primary/10 transition-all w-full sm:w-auto inline-flex items-center justify-center gap-2"
          >
            <Smartphone className="w-5 h-5" />
            Instalar no celular
          </button>
        </div>
      </main>

      {/* Feature Cards */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pb-32">
        {/* Connecting Background Line */}
        <div className="absolute top-[45%] left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent -z-10 hidden md:block" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-[1px] rounded-3xl bg-gradient-to-b from-white/15 to-transparent relative group">
            <div className="h-full bg-[#0c121e]/90 backdrop-blur-xl rounded-[23px] p-8 text-left relative overflow-hidden shadow-2xl transition-transform hover:-translate-y-1 duration-300">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-primary/10 blur-[50px] pointer-events-none" />

              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1c273c] to-[#0c121e] border border-primary/20 flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(var(--primary),0.2)] relative">
                <MessageSquare className="w-10 h-10 text-primary" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">Fóruns Dinâmicos</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Discuta ideias, tire dúvidas e compartilhe seus projetos com pessoas que falam a
                mesma língua que você.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-[1px] rounded-3xl bg-gradient-to-b from-white/15 to-transparent relative group">
            <div className="h-full bg-[#0c121e]/90 backdrop-blur-xl rounded-[23px] p-8 text-left relative overflow-hidden shadow-2xl transition-transform hover:-translate-y-1 duration-300">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-secondary/10 blur-[50px] pointer-events-none" />

              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1c273c] to-[#0c121e] border border-secondary/20 flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(var(--secondary),0.2)] relative">
                <Trophy className="w-10 h-10 text-secondary" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">Gamificação e Recompensas</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Ganhe XP e Nexus Coins ajudando os outros. Suba no ranking e troque moedas por
                benefícios premium.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-[1px] rounded-3xl bg-gradient-to-b from-white/15 to-transparent relative group">
            <div className="h-full bg-[#0c121e]/90 backdrop-blur-xl rounded-[23px] p-8 text-left relative overflow-hidden shadow-2xl transition-transform hover:-translate-y-1 duration-300">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-emerald-500/10 blur-[50px] pointer-events-none" />

              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1c273c] to-[#0c121e] border border-emerald-500/20 flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(16,185,129,0.2)] relative">
                <Network className="w-10 h-10 text-emerald-400" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">Núcleos Fechados</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Assine grupos premium criados por especialistas ou crie o seu próprio grupo fechado
                exclusivo.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
