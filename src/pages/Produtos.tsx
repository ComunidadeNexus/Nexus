import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { ProducerProduct } from "@/hooks/useProducer";

const Produtos = () => {
  const [products, setProducts] = useState<ProducerProduct[]>([]);

  useEffect(() => {
    void supabase
      .from("producer_products")
      .select("id, producer_id, title, description, price, status, checkout_url, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .then(({ data }) => setProducts((data || []) as ProducerProduct[]));
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Produtos</h1>
      {products.length === 0 ? (
        <p className="text-muted-foreground">Nenhum produto à venda no momento.</p>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/produtos/${product.id}`}
              className="block rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
            >
              <h2 className="font-semibold">{product.title}</h2>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
              <p className="text-primary font-medium mt-3">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(product.price))}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Produtos;
