import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { ProducerProduct } from "@/hooks/useProducer";

const ProducerProducts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<ProducerProduct[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("producer_products")
      .select("id, producer_id, title, description, price, status, checkout_url, created_at")
      .eq("producer_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data || []) as ProducerProduct[]);
  };

  useEffect(() => {
    void load();
  }, [user]);

  const publish = async () => {
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("cakto-publish-product", {
      body: { title, description, price: Number(price) },
    });
    setSaving(false);
    if (error || data?.error) {
      toast({ variant: "destructive", title: "Não publicou", description: data?.error || error?.message });
      return;
    }
    toast({ title: data?.warning ? "Rascunho salvo" : "Produto publicado", description: data?.warning });
    setTitle("");
    setDescription("");
    setPrice("");
    await load();
  };

  return (
    <div className="space-y-6">
      <form
        className="space-y-3 rounded-xl border border-white/10 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          void publish();
        }}
      >
        <h2 className="font-semibold">Novo produto</h2>
        <div className="space-y-2">
          <Label>Título</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Descrição</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Preço (R$)</Label>
          <Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publicar na Cakto"}
        </Button>
      </form>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-white/10 p-3 flex justify-between gap-4">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.status}</p>
            </div>
            <p>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(item.price))}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProducerProducts;
