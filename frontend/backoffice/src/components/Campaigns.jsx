import React, { useEffect, useState } from "react";
import { useAxiosClient } from "@/utils/axiosClient";
import Utilities from "@/components/Utilities";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import CardList from "@/components/CardList";
import CampaignCard from "@/components/CampaignCard";

export default function Campaigns({ onNotifySuccess, onNotifyError }) {
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
    } catch (error) {
      console.error("Error loading campaigns:", error);
      onNotifyError?.(
        "Erreur de chargement",
        "Impossible de charger les campagnes",
      );
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [axios]);

  const handleImportHelloAsso = async () => {
    try {
      await axios.post("/api/helloasso/import");
      await fetchCampaigns();
      onNotifySuccess?.(
        "Import HelloAsso terminé",
        "Les données ont été mises à jour avec succès",
      );
    } catch (error) {
      console.error("Erreur lors de l'import HelloAsso:", error);
      onNotifyError?.(
        "Erreur d'import",
        "Impossible d'importer les données HelloAsso",
      );
    }
  };

  const handleCampaignClick = (campaign) => {
    if (campaign.url) {
      window.open(campaign.url, "_blank");
    }
  };

  const filteredCampaigns = campaigns.filter(
    (campaign) => campaign.title !== "Checkout",
  );

  return (
    <>
      <Utilities
        actions={[
          {
            icon: ArrowPathIcon,
            label: "Actualiser HelloAsso",
            callback: handleImportHelloAsso,
            variant: "refresh",
          },
        ]}
      />

      <CardList emptyMessage="Aucune campagne trouvée.">
        {filteredCampaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onClick={() => handleCampaignClick(campaign)}
          />
        ))}
      </CardList>
    </>
  );
}
