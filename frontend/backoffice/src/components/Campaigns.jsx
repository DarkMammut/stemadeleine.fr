import React, { useEffect, useState } from "react";
import Flag from "@/components/ui/Flag";
import { useAxiosClient } from "@/utils/axiosClient";
import Utilities from "@/components/Utilities";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import Currency from "@/components/Currency";

export default function Campaigns() {
  const axios = useAxiosClient();
  const [campaigns, setCampaigns] = useState([]);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get("/api/campaigns");
      const campaignsData = res.data;
      // Récupérer le montant collecté pour chaque campagne
      const campaignsWithAmount = await Promise.all(
        campaignsData.map(async (campaign) => {
          if (campaign.title === "Checkout" || !campaign.formSlug)
            return { ...campaign, collectedAmount: 0 };
          try {
            const amountRes = await axios.get(
              `/api/payments/total/${campaign.formSlug}`,
            );
            return { ...campaign, collectedAmount: amountRes.data };
          } catch {
            return { ...campaign, collectedAmount: 0 };
          }
        }),
      );
      setCampaigns(campaignsWithAmount);
    } catch {
      setCampaigns([]);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [axios]);

  const handleImportHelloAsso = async () => {
    try {
      await axios.post("/api/helloasso/import");
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
    return "secondary";
  }

  return (
    <>
      <Utilities
        actions={[
          {
            icon: ArrowPathIcon,
            label: "Actualiser HelloAsso",
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
                Montant collecté :{" "}
                <Currency
                  value={campaign.collectedAmount}
                  currency={campaign.currency}
                />
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
