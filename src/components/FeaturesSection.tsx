import { 
  MessageSquare, 
  Users, 
  Shield, 
  Bell, 
  Search, 
  Image,
  Heart,
  AtSign,
  Hash
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Feed Inteligente",
    description: "Postagens, comentários e reações em tempo real com algoritmo de relevância.",
  },
  {
    icon: Users,
    title: "Grupos & Subcomunidades",
    description: "Crie espaços exclusivos para diferentes interesses e nichos.",
  },
  {
    icon: Shield,
    title: "Moderação Avançada",
    description: "Sistema de denúncias, filtros automáticos e controle total do conteúdo.",
  },
  {
    icon: Bell,
    title: "Notificações Push",
    description: "Alertas em tempo real via push, email e in-app personalizáveis.",
  },
  {
    icon: Search,
    title: "Busca Poderosa",
    description: "Encontre qualquer conteúdo, usuário ou grupo instantaneamente.",
  },
  {
    icon: Image,
    title: "Rich Media",
    description: "Upload de imagens, vídeos, enquetes e conteúdo interativo.",
  },
  {
    icon: Heart,
    title: "Reações Customizadas",
    description: "Crie emojis exclusivos da sua comunidade para engajamento único.",
  },
  {
    icon: AtSign,
    title: "Menções & Tags",
    description: "Sistema completo de @menções e #tags para organização.",
  },
  {
    icon: Hash,
    title: "Categorias",
    description: "Organize conteúdo em categorias e tópicos personalizados.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Recursos Completos</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Tudo que sua comunidade{' '}
            <span className="gradient-text">precisa</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Ferramentas profissionais para criar, engajar e crescer sua comunidade.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card p-6 rounded-2xl hover:scale-105 hover:border-primary/30 transition-all duration-300 group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
