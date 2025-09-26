import React, { useEffect, useState } from "react";
import Flag from "@/components/ui/Flag";
import { useAxiosClient } from "@/utils/axiosClient";
import Utilities from "@/components/Utilities";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function Campaigns() {
  const axios = useAxiosClient();
  const [campaigns, setCampaigns] = useState([]);

  const fetchCampaigns = () => {
    axios
      .get("/api/campaigns")
      .then((res) => setCampaigns(res.data))
      .catch(() => setCampaigns([]));
  };

  useEffect(() => {
    fetchCampaigns();
  }, [axios]);

  const handleImportHelloAsso = async () => {
    try {
      await axios.post("/api/campaigns/import");
      fetchCampaigns();
      alert("Import HelloAsso terminé avec succès.");
    } catch (error) {
      console.error("Erreur lors de l'import HelloAsso:", error);
      alert("Erreur lors de l'import HelloAsso");
    }
  };

  function getFlagVariant(state) {
    if (state === "Public") return "primary";
    if (state === "Private") return "danger";
    return "secondary"; // ou autre valeur par défaut
  }

  return (
    <>
      <Utilities
        actions={[
          {
            icon: ArrowPathIcon,
            label: "Actualiser les campagnes",
            callback: handleImportHelloAsso,
          },
        ]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns
          .filter((campaign) => campaign.title !== "Checkout")
          .map((campaign) => (
            <div
              key={campaign.id}
              className="p-4 rounded-2xl shadow cursor-pointer hover:bg-secondary"
              onClick={() => window.open(campaign.url, "_blank")}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-lg">{campaign.title}</span>
                <Flag variant={getFlagVariant(campaign.state)}>
                  {campaign.state}
                </Flag>
              </div>
              <div className="text-sm text-gray-600 mb-1">
                Montant collecté : {campaign.collectedAmount} €
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
