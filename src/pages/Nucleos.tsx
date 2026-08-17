import { useState } from "react";
import { Search, Plus, TrendingUp, Users, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNavigation from "@/components/BottomNavigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NucleoCard from "@/components/nucleos/NucleoCard";
import CreateNucleoModal from "@/components/nucleos/CreateNucleoModal";
import { useNucleos } from "@/hooks/useNucleos";
import { useAuth } from "@/contexts/AuthContext";

const Nucleos = () => {
  const { user } = useAuth();
  const { nucleos, myNucleos, isLoading, joinNucleo, leaveNucleo, isMember, fetchNucleos, fetchMyNucleos } = useNucleos();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("discover");

  const filteredNucleos = nucleos.filter(
    (nucleo) =>
      nucleo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nucleo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMyNucleos = myNucleos.filter(
    (nucleo) =>
      nucleo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nucleo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = () => {
    fetchNucleos();
    fetchMyNucleos();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Núcleos</h1>
            <p className="text-muted-foreground">
              Encontre e participe de subcomunidades
            </p>
          </div>
          {user && (
            <CreateNucleoModal onSuccess={handleRefresh} />
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar núcleos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="discover" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Descobrir
            </TabsTrigger>
            {user && (
              <TabsTrigger value="my-nucleos" className="gap-2">
                <Users className="w-4 h-4" />
                Meus Núcleos
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="discover">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredNucleos.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum núcleo encontrado</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Tente uma busca diferente"
                    : "Seja o primeiro a criar um núcleo!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNucleos.map((nucleo) => (
                  <NucleoCard
                    key={nucleo.id}
                    nucleo={nucleo}
                    isMember={isMember(nucleo.id)}
                    onJoin={joinNucleo}
                    onLeave={leaveNucleo}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-nucleos">
            {filteredMyNucleos.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">
                  Você ainda não participa de nenhum núcleo
                </h3>
                <p className="text-muted-foreground mb-4">
                  Explore a aba "Descobrir" para encontrar núcleos interessantes
                </p>
                <Button variant="outline" onClick={() => setActiveTab("discover")}>
                  Descobrir Núcleos
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMyNucleos.map((nucleo) => (
                  <NucleoCard
                    key={nucleo.id}
                    nucleo={nucleo}
                    isMember={true}
                    onJoin={joinNucleo}
                    onLeave={leaveNucleo}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Nucleos;
