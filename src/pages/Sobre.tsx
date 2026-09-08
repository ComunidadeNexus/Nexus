import React from "react";
import { useNavigate } from "react-router-dom";
import { Zap, ArrowLeft, MessageSquare, Trophy, Network } from "lucide-react";

const Sobre = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "-3s" }}
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Navbar-like back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 font-display">
            Sobre o Nexus
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            O Nexus é o seu lar digital. Uma plataforma criada para conectar mentes criativas,
            compartilhar conhecimento e construir comunidades fortes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-2xl border border-white/10 relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <MessageSquare className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Fóruns Dinâmicos</h3>
            <p className="text-muted-foreground">
              Discuta ideias, tire dúvidas e compartilhe seus projetos em comunidades focadas no que
              você ama.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-white/10 relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute top-0 left-0 w-full h-1 bg-secondary"></div>
            <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
              <Trophy className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Gamificação</h3>
            <p className="text-muted-foreground">
              Ganhe XP e Nexus Coins interagindo. Suba no ranking e troque moedas por benefícios
              premium dentro da plataforma.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-white/10 relative overflow-hidden group hover:-translate-y-1 transition-transform">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
              <Network className="w-7 h-7 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold mb-3">Núcleos Fechados</h3>
            <p className="text-muted-foreground">
              Participe de grupos exclusivos criados por especialistas ou crie sua própria
              comunidade fechada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sobre;
