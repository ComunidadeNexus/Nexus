import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Download, PlayCircle, Crown, Search, Loader2 } from "lucide-react";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { usePremiumItems, PREMIUM_CATEGORIES, type PremiumItem } from "@/hooks/usePremiumItems";

const PremiumArea = () => {
  const { hasAccess, loading: accessLoading } = usePremiumAccess();
  const { items, isLoading: itemsLoading } = usePremiumItems("public");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("todos");

  const categories = useMemo(() => {
    const present = new Set(items.map((item) => item.category));
    return PREMIUM_CATEGORIES.filter((c) => present.has(c.value));
  }, [items]);

  const filteredContent = items.filter((item) => {
    const haystack = `${item.title} ${item.description || ""}`.toLowerCase();
    const matchesSearch = haystack.includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "todos" || item.category === activeTab;
    return matchesSearch && matchesTab;
  });

  if (accessLoading) {
    return (
      <div className="p-8 flex justify-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/assinatura" replace />;
  }

  const renderCard = (item: PremiumItem) => {
    const dateLabel = format(new Date(item.created_at), "dd MMM yyyy", { locale: ptBR });

    if (item.content_type === "download") {
      return (
        <Card
          key={item.id}
          className="bg-card/50 border-white/10 hover:border-yellow-500/50 transition-all hover:-translate-y-1"
        >
          {item.thumbnail_url && (
            <div
              className="h-36 w-full bg-cover bg-center rounded-t-xl"
              style={{ backgroundImage: `url(${item.thumbnail_url})` }}
            />
          )}
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg">{item.title}</CardTitle>
            {item.description && <CardDescription>{item.description}</CardDescription>}
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>Atualizado: {dateLabel}</p>
            {item.meta && <p>Tamanho: {item.meta}</p>}
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black" asChild>
              <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" /> Baixar arquivo
              </a>
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
        <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="block">
          <div
            className="aspect-video bg-muted/30 flex items-center justify-center relative group"
            style={
              item.thumbnail_url
                ? { backgroundImage: `url(${item.thumbnail_url})`, backgroundSize: "cover" }
                : undefined
            }
          >
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
            <PlayCircle className="w-12 h-12 text-yellow-500 z-10 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
          </div>
        </a>
        <CardHeader>
          <CardTitle className="text-lg">{item.title}</CardTitle>
          {item.description && <CardDescription>{item.description}</CardDescription>}
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground flex justify-between">
          <span>{item.meta ? `Duração: ${item.meta}` : dateLabel}</span>
          <span className="flex items-center text-yellow-500">
            <Crown className="w-3 h-3 mr-1" /> Exclusivo
          </span>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-r from-yellow-500/20 via-yellow-600/10 to-transparent p-8 rounded-3xl border border-yellow-500/20">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-medium mb-2 border border-yellow-500/20">
            <Crown className="w-3 h-3" /> Assinante Premium
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Bem-vindo ao Cofre
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg">
            Materiais exclusivos, ferramentas e aulas publicados pela equipe Nexus.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar no cofre..."
            className="pl-9 bg-black/20 border-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-between items-end mb-6">
          <TabsList className="bg-black/20 border border-white/5">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            {categories.map((c) => (
              <TabsTrigger key={c.value} value={c.value}>
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {itemsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : filteredContent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map(renderCard)}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center opacity-70">
            <Search className="w-12 h-12 mb-4" />
            <h3 className="text-xl font-medium">Nenhum prêmio por aqui ainda</h3>
            <p className="text-muted-foreground">
              {items.length === 0
                ? "Quando o admin publicar algo, aparece nesta página."
                : "Tente buscar por outro termo ou categoria."}
            </p>
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default PremiumArea;
