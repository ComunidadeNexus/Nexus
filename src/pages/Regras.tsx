import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, BookOpen, UserX, AlertTriangle, ArrowLeft } from "lucide-react";

const Regras = () => {
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

        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
            <ShieldAlert className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 font-display">
            Regras da Comunidade
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Diretrizes para manter o Nexus um ambiente seguro, respeitoso e incrível para todos os
            membros.
          </p>
        </div>

        <div className="space-y-8">
          {/* Seção 1 */}
          <section className="glass-card p-8 rounded-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <BookOpen className="w-6 h-6 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold">1. Respeito Acima de Tudo</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              O Nexus é um espaço para todos. Não toleramos discurso de ódio, racismo, machismo,
              homofobia, transfobia, intolerância religiosa ou qualquer forma de discriminação.
              Ataques pessoais e assédio resultarão em banimento imediato e permanente.
            </p>
          </section>

          {/* Seção 2 */}
          <section className="glass-card p-8 rounded-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold">2. Conteúdo Estritamente Proibido</h2>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></span>
                <span>
                  Qualquer forma de conteúdo explícito (NSFW), pornografia ou violência gráfica.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></span>
                <span>Venda, promoção ou compartilhamento de substâncias ilícitas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></span>
                <span>
                  Pirataria, cheats (hacks de jogos), vazamentos de dados ou atividades ilegais.
                </span>
              </li>
            </ul>
          </section>

          {/* Seção 3 */}
          <section className="glass-card p-8 rounded-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <ShieldAlert className="w-6 h-6 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold">3. Spam, Scams e Autopromoção</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Mensagens não solicitadas, anúncios repetitivos e esquemas de enriquecimento rápido
              são proibidos. A autopromoção só é permitida nas áreas e núcleos específicos para isso
              (como o Marketplace ou canais dedicados de divulgação). A tentativa de golpes (scam)
              resultará em banimento e denúncia.
            </p>
          </section>

          {/* Seção 4 */}
          <section className="glass-card p-8 rounded-2xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-purple-500"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <UserX className="w-6 h-6 text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold">4. Sistema de Punições (Bans)</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Nossa equipe de moderação age proativamente e também analisa denúncias da comunidade.
              As punições variam de acordo com a gravidade:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 w-24 flex justify-center">
                  Aviso
                </span>
                <span>Para infrações leves. Seu conteúdo é removido e você é notificado.</span>
              </li>
              <li className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-orange-500/20 text-orange-500 border border-orange-500/50 w-24 flex justify-center">
                  Suspensão
                </span>
                <span>Bloqueio temporário (24h a 7 dias) de acesso à plataforma.</span>
              </li>
              <li className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-red-500/20 text-red-500 border border-red-500/50 w-24 flex justify-center">
                  Banimento
                </span>
                <span>Bloqueio permanente. O acesso e os dados são travados imediatamente.</span>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Ao criar uma conta na Nexus, você concorda automaticamente com estas regras.</p>
          <p className="mt-2">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
        </div>
      </div>
    </div>
  );
};

export default Regras;
