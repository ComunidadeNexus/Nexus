const ProducerSubscriptions = () => (
  <div className="space-y-3">
    <h2 className="font-semibold">Assinaturas</h2>
    <p className="text-sm text-muted-foreground">
      Assinaturas Cakto entram aqui quando o webhook `subscription_created` / `subscription_renewed`
      confirmar o pagamento. O plano Nexus Pro usa `cakto_offer_id_monthly` e `cakto_offer_id_yearly`
      em `plans`, preenchidos no admin.
    </p>
  </div>
);

export default ProducerSubscriptions;
