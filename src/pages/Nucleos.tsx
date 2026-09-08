import { useState } from "react";
import { Search, Users, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import NucleoCard from "@/components/nucleos/NucleoCard";
import { useNucleos } from "@/hooks/useNucleos";

const Nucleos = () => {
  const { nucleos, isLoading, joinNucleo, leaveNucleo, isMember } = useNucleos();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNucleos = nucleos.filter(
    (nucleo) =>
      nucleo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nucleo.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full">
      <main className="w-full mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Explorar Comunidades</h1>
            <p className="text-muted-foreground">
              Encontre e participe dos núcleos (comunidades) já criados
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar comunidades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Lista de Comunidades */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredNucleos.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#1A282D] rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhuma comunidade encontrada</h3>
            <p className="text-muted-foreground">Tente uma busca diferente.</p>
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
      </main>
    </div>
  );
};

export default Nucleos;
