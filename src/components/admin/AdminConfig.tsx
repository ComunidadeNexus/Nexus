import { useEffect, useState } from "react";
import { useAdminData } from "@/hooks/useAdminData";
import { Settings, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const AdminConfig = () => {
  const { settings, fetchSettings, updateSetting } = useAdminData();

  // Local states for settings we want to edit
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [globalXpMultiplier, setGlobalXpMultiplier] = useState("1.0");

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const maintenanceSetting = settings.find((s) => s.key === "maintenance_mode");
    if (maintenanceSetting) {
      setMaintenanceMode(maintenanceSetting.value === "true");
    }

    const xpSetting = settings.find((s) => s.key === "global_xp_multiplier");
    if (xpSetting) {
      setGlobalXpMultiplier(String(xpSetting.value));
    }
  }, [settings]);

  const handleSaveMaintenance = () => {
    updateSetting("maintenance_mode", String(maintenanceMode));
  };

  const handleSaveXp = () => {
    updateSetting("global_xp_multiplier", globalXpMultiplier);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="w-8 h-8 text-purple-500" />
            Configurações Globais
          </h2>
          <p className="text-gray-400 mt-1">Gerencie ajustes gerais do sistema.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#1a1f2e] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Modo de Manutenção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-gray-300">Ativar Manutenção</Label>
                <p className="text-sm text-gray-500">Impede acessos não-admin ao site.</p>
              </div>
              <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
            </div>
            <Button onClick={handleSaveMaintenance} className="w-full">
              <Save className="w-4 h-4 mr-2" /> Salvar Status
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1f2e] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-lg">Multiplicador Global de XP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Multiplicador Atual</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={globalXpMultiplier}
                onChange={(e) => setGlobalXpMultiplier(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-sm text-gray-500">Use 2.0 para "XP em dobro", por exemplo.</p>
            </div>
            <Button onClick={handleSaveXp} className="w-full">
              <Save className="w-4 h-4 mr-2" /> Salvar Multiplicador
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminConfig;
