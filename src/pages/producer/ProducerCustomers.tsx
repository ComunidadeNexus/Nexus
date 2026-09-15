import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ProducerCustomers = () => {
  const { user } = useAuth();
  const [emails, setEmails] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("orders")
      .select("buyer_email")
      .eq("seller_id", user.id)
      .eq("payment_status", "paid")
      .then(({ data }) => {
        const unique = [...new Set((data || []).map((r) => r.buyer_email).filter(Boolean))] as string[];
        setEmails(unique);
      });
  }, [user]);

  return (
    <div className="space-y-3">
      <h2 className="font-semibold">Clientes</h2>
      {emails.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum cliente pago ainda.</p>
      ) : (
        emails.map((email) => (
          <p key={email} className="text-sm border border-white/10 rounded-lg p-3">
            {email}
          </p>
        ))
      )}
    </div>
  );
};

export default ProducerCustomers;
