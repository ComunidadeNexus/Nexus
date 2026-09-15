import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { ProducerProduct } from "@/hooks/useProducer";

const ProdutoDetalhe = () => {
  const { productId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<ProducerProduct | null>(null);
  const [buying, setBuying] = useState(false);
  const [owned, setOwned] = useState(false);

  useEffect(() => {
    if (!productId) return;
    void supabase
      .from("producer_products")
      .select("id, producer_id, title, description, price, status, checkout_url, created_at")
      .eq("id", productId)
      .maybeSingle()
      .then(({ data }) => setProduct(data as ProducerProduct | null));
  }, [productId]);

  useEffect(() => {
    if (!user || !productId) return;
    void supabase
      .from("product_entitlements")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle()
      .then(({ data }) => setOwned(Boolean(data)));
  }, [user, productId]);

  const buy = async () => {
    if (!product) return;
    setBuying(true);
    const { data, error } = await supabase.functions.invoke("cakto-checkout", {
      body: { product_id: product.id },
    });
    setBuying(false);
    if (error || data?.error || !data?.checkout_url) {
      toast({ variant: "destructive", title: "Não foi possível iniciar o pagamento", description: data?.error || error?.message });
      return;
    }
    window.location.href = data.checkout_url;
  };

  if (!product) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-4">
      <h1 className="text-3xl font-bold">{product.title}</h1>
      <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
      <p className="text-2xl font-semibold text-primary">
        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(product.price))}
      </p>
      {owned ? (
        <p className="text-emerald-400">Você já tem acesso a este produto.</p>
      ) : (
        <Button variant="gradient" size="lg" onClick={() => void buy()} disabled={buying}>
          {buying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Comprar com Cakto"}
        </Button>
      )}
    </div>
  );
};

export default ProdutoDetalhe;
