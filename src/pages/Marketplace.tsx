import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMarketplace, ListingCategory } from "@/hooks/useMarketplace";
import Navbar from "@/components/Navbar";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Heart, Eye, Loader2, Package, Briefcase, Monitor } from "lucide-react";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  produto: Package,
  servico: Briefcase,
  digital: Monitor,
};

const Marketplace = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ListingCategory | undefined>();
  const { listings, sellers, favorites, isLoading, toggleFavorite } = useMarketplace({
    search: search || undefined,
    category,
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold gradient-text">Marketplace</h1>
          <Button onClick={() => navigate("/marketplace/novo")} className="gap-2">
            <Plus className="w-4 h-4" />
            Anunciar
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-10"
            />
          </div>
          <Tabs value={category || "all"} onValueChange={(v) => setCategory(v === "all" ? undefined : v as ListingCategory)}>
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="produto">Produtos</TabsTrigger>
              <TabsTrigger value="servico">Serviços</TabsTrigger>
              <TabsTrigger value="digital">Digitais</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Listings */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <p className="text-muted-foreground">Nenhum anúncio encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings.map((listing) => {
              const IconComponent = categoryIcons[listing.category] || Package;
              const seller = sellers[listing.user_id];
              const isFavorited = favorites.has(listing.id);

              return (
                <Card
                  key={listing.id}
                  className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => navigate(`/marketplace/${listing.id}`)}
                >
                  {/* Image */}
                  <div className="aspect-square bg-muted relative">
                    {listing.images[0] ? (
                      <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IconComponent className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 bg-background/80"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(listing.id); }}
                    >
                      <Heart className={`w-4 h-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-medium truncate">{listing.title}</h3>
                    <p className="text-lg font-bold text-primary mt-1">
                      R$ {listing.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary" className="gap-1">
                        <IconComponent className="w-3 h-3" />
                        {listing.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {listing.views_count}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Marketplace;
