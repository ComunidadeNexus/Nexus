import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  MARKETPLACE_CATEGORIES,
  type MarketplaceCategory,
  type MarketplaceHighlight,
} from "@/lib/marketplace";
import { MarketplaceCategoryIcon } from "./MarketplaceCategoryIcon";

type MarketplaceCategoriesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCategory?: string | null;
  onPickCategory: (category: MarketplaceCategory) => void;
  onPickHighlight: (category: MarketplaceCategory, highlight: MarketplaceHighlight) => void;
};

const MarketplaceCategoriesDialog = ({
  open,
  onOpenChange,
  activeCategory,
  onPickCategory,
  onPickHighlight,
}: MarketplaceCategoriesDialogProps) => {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"popular" | "az">("popular");
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const selected =
    MARKETPLACE_CATEGORIES.find((category) => category.slug === (hoveredSlug || activeCategory)) ||
    MARKETPLACE_CATEGORIES[0];

  const highlights = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const items = selected.highlights.filter((item) =>
      needle ? item.label.toLowerCase().includes(needle) : true,
    );
    if (sort === "az") {
      return [...items].sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
    }
    return items;
  }, [query, selected, sort]);

  const filteredCategories = MARKETPLACE_CATEGORIES.filter((category) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return (
      category.label.toLowerCase().includes(needle) ||
      category.highlights.some((item) => item.label.toLowerCase().includes(needle))
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[960px] w-[calc(100vw-1.5rem)] p-4 sm:p-6 bg-[#0b1018] border-white/10 text-white overflow-y-auto max-h-[90vh]">
        <DialogTitle className="sr-only">Categorias do Marketplace</DialogTitle>
        <DialogDescription className="sr-only">
          Busque um jogo, serviço ou categoria para filtrar os anúncios.
        </DialogDescription>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar jogo ou categoria..."
            className="h-12 pl-12 rounded-full bg-transparent border-[#00C6FF]/70 text-white placeholder:text-white/40"
          />
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 mb-4 scrollbar-thin">
          {filteredCategories.map((category) => {
            const isActive = selected.slug === category.slug;
            return (
              <button
                key={category.slug}
                type="button"
                onMouseEnter={() => setHoveredSlug(category.slug)}
                onFocus={() => setHoveredSlug(category.slug)}
                onClick={() => onPickCategory(category)}
                className="flex flex-col items-center gap-2 min-w-[92px] shrink-0"
              >
                <span
                  className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${
                    isActive
                      ? "border-[#00C6FF] text-[#00C6FF] bg-[#00C6FF]/10"
                      : "border-white/10 text-white/70 bg-white/5"
                  }`}
                >
                  <MarketplaceCategoryIcon name={category.icon} className="w-6 h-6" />
                </span>
                <span
                  className={`text-xs text-center leading-tight ${
                    isActive ? "text-[#00C6FF] font-semibold" : "text-white/70"
                  }`}
                >
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSort("popular")}
              className={`min-h-9 px-3 rounded-full text-sm font-semibold ${
                sort === "popular"
                  ? "bg-[#00C6FF] text-[#0b1018]"
                  : "bg-transparent text-white/60 hover:text-white"
              }`}
            >
              Popular
            </button>
            <button
              type="button"
              onClick={() => setSort("az")}
              className={`min-h-9 px-3 rounded-full text-sm font-semibold ${
                sort === "az"
                  ? "bg-[#00C6FF] text-[#0b1018]"
                  : "bg-transparent text-white/60 hover:text-white"
              }`}
            >
              A-Z
            </button>
          </div>
          <p className="text-xs text-white/40 hidden sm:block">
            {sort === "az"
              ? "Lista em ordem alfabética"
              : `${highlights.length} destaques nesta categoria`}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {highlights.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => onPickHighlight(selected, item)}
              className="group text-left"
            >
              <div
                className={`aspect-[16/10] rounded-xl bg-gradient-to-br ${item.accent} border border-white/10 flex items-end p-2`}
              >
                <span className="text-xs font-bold text-white drop-shadow">{item.label}</span>
              </div>
              <p className="mt-1.5 text-xs text-white/70 group-hover:text-white truncate">
                {item.label}
              </p>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPickCategory(selected)}
          className="mt-5 text-sm text-[#00C6FF] hover:underline ml-auto block"
        >
          Ver toda a categoria →
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default MarketplaceCategoriesDialog;
