import { useProducer } from "@/hooks/useProducer";

const ProducerSettings = () => {
  const { profile, statusLabel } = useProducer();
  return (
    <div className="space-y-3 text-sm">
      <h2 className="font-semibold">Configurações</h2>
      <p>{statusLabel}</p>
      {profile && (
        <>
          <p>Tipo: {profile.producer_type === "company" ? "PJ" : "PF"}</p>
          <p>Documento: ••••{profile.tax_id_last4}</p>
          <p>KYC: {profile.kyc_status}</p>
        </>
      )}
    </div>
  );
};

export default ProducerSettings;
