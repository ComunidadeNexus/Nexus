import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  PlayCircle,
  Lock,
  Crown,
  Search,
  Rocket,
  Sparkles,
  Video,
  Wrench,
} from "lucide-react";

// Dados mockados para exemplo
const premiumContent = [
  {
    id: 1,
    type: "download",
    category: "ferramentas",
    title: "Kit de Templates Notion",
    desc: "Templates exclusivos de organização para a comunidade.",
    date: "Hoje",
    meta: "2.4 MB",
  },
  {
    id: 2,
    type: "download",
    category: "ferramentas",
    title: "Script de Automação",
    desc: "Script Python para ajudar no fluxo de trabalho diário.",
    date: "Ontem",
    meta: "120 KB",
  },
  {
    id: 3,
    type: "download",
    category: "marketing",
    title: "Guia de Copywriting",
    desc: "E-book com estruturas validadas de alta conversão.",
    date: "Semana passada",
    meta: "5.1 MB",
  },
  {
    id: 4,
    type: "video",
    category: "masterclass",
    title: "Masterclass: O Segredo das Comunidades",
    desc: "Aprenda como crescer sua comunidade do zero.",
    date: "Mês passado",
    meta: "45 min",
  },
  {
    id: 5,
    type: "video",
    category: "bastidores",
    title: "Bastidores: Criando o Nexus Hub",
    desc: "Acompanhe como estruturamos a base do projeto.",
    date: "2 meses atrás",
    meta: "22 min",
  },
];

const PremiumArea = () => {
  const { user } = useAuth();
  const { subscribed, tier, isLoading } = useSubscription();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");

  if (isLoading) {
    return <div className="p-8 flex justify-center text-muted-foreground">Carregando...</div>;
  }

  // Se não tem assinatura ativa redireciona pra assinar
  if (!subscribed || tier === "free") {
    return <Navigate to="/assinatura" replace />;
  }

  const filteredContent = premiumContent.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "todos" || item.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const renderCard = (item: any) => {
    if (item.type === "download") {
      return (
        <Card
          key={item.id}
          className="bg-card/50 border-white/10 hover:border-yellow-500/50 transition-all hover:-translate-y-1"
        >
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Wrench className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <CardDescription>{item.desc}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Atualizado: {item.date}</p>
            <p>Tamanho: {item.meta}</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
              <Download className="w-4 h-4 mr-2" /> Baixar Arquivo
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return (
      <Card
        key={item.id}
        className="bg-card/50 border-white/10 hover:border-yellow-500/50 transition-all hover:-translate-y-1 overflow-hidden"
      >
        <div className="aspect-video bg-muted/30 flex items-center justify-center relative group cursor-pointer">
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
          <PlayCircle className="w-12 h-12 text-yellow-500 z-10 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
        </div>
        <CardHeader>
          <CardTitle className="text-lg">{item.title}</CardTitle>
          <CardDescription>{item.desc}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground flex justify-between">
          <span>Duração: {item.meta}</span>
          <span className="flex items-center text-yellow-500">
            <Crown className="w-3 h-3 mr-1" /> Exclusivo
          </span>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-10 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-yellow-500/20 via-yellow-600/10 to-transparent p-8 rounded-3xl border border-yellow-500/20">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-medium mb-2 border border-yellow-500/20">
            <Crown className="w-3 h-3" /> Assinante Premium
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Bem-vindo ao Cofre
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg">
            Aqui você encontra todos os seus materiais exclusivos, ferramentas e masterclasses.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar ferramentas..."
            className="pl-9 bg-black/20 border-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Navigation & Content */}
      <Tabs defaultValue="todos" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-between items-end mb-6">
          <TabsList className="bg-black/20 border border-white/5">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="ferramentas">Ferramentas</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="masterclass">Masterclasses</TabsTrigger>
            <TabsTrigger value="bastidores">Bastidores</TabsTrigger>
          </TabsList>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.length > 0 ? (
            filteredContent.map(renderCard)
          ) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center justify-center opacity-50">
              <Search className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-medium">Nenhum resultado encontrado</h3>
              <p>Tente buscar por outro termo ou categoria.</p>
            </div>
          )}
        </div>
      </Tabs>

      {/* Roadmap / Em Breve Section */}
      <div className="mt-16 pt-10 border-t border-white/10">
        <div className="flex items-center gap-2 mb-6">
          <Rocket className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">O que vem por aí?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="bg-black/20 border-white/5 opacity-70">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center mb-2">
                <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                  Setembro
                </Badge>
                <Sparkles className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-base">Pack de Artes para Social Media</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>100 templates editáveis no Canva.</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-white/5 opacity-70">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center mb-2">
                <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                  Outubro
                </Badge>
                <Video className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-base">Curso Exclusivo: Tráfego Pago</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>5 horas de aulas direto ao ponto.</p>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-white/5 opacity-70 flex flex-col items-center justify-center text-center p-6 border-dashed">
            <Lock className="w-6 h-6 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Mais surpresas a caminho</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PremiumArea;
