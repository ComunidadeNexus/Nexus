import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Users, Zap, Trophy } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-xp rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">
              +10.000 comunidades ativas
            </span>
          </div>

          {/* Main Title */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Construa sua{' '}
            <span className="gradient-text">comunidade</span>
            <br />
            do futuro
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Engaje, monetize e escale sua comunidade com gamificação avançada, 
            rankings em tempo real e ferramentas de crescimento poderosas.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Button variant="hero" size="xl" onClick={() => window.location.href = '/auth?mode=signup'}>
              Assinar Agora
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="glass" size="xl" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
              <Play className="w-5 h-5" />
              Ver Plano
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="font-display text-3xl font-bold gradient-text">2M+</div>
              <div className="text-sm text-muted-foreground">Usuários Ativos</div>
            </div>
            
            <div className="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <div className="font-display text-3xl font-bold gradient-text">50M+</div>
              <div className="text-sm text-muted-foreground">Interações/Dia</div>
            </div>
            
            <div className="glass-card p-6 rounded-2xl text-center hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-gold" />
              </div>
              <div className="font-display text-3xl font-bold gradient-text">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
