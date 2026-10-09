import React, { useEffect, useState } from "react";
import { useAxiosClient } from "@/utils/axiosClient";
import Utilities from "@/components/ui/Utilities";
import CampaignCard from "@/components/CampaignCard";
import CardLayout from "@/components/ui/CardLayout";
import { useTranslation } from "@/i18n/I18nContext";

export default function Campaigns({ onNotifyError, refreshSignal }) {
  const { t } = useTranslation();
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
        t("dashboard.campaignsLoadErrorTitle"),
        t("dashboard.campaignsLoadErrorMessage"),
      );
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [axios]);

  // when parent increments refreshSignal, refetch campaigns
  useEffect(() => {
    if (typeof refreshSignal !== "undefined") {
      fetchCampaigns();
    }
  }, [refreshSignal]);

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
      {/* Utilities left empty here - refresh is provided by parent Title */}
      <Utilities actions={[]} />

      <CardLayout emptyMessage={t("dashboard.noCampaigns")}>
        {filteredCampaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onClick={() => handleCampaignClick(campaign)}
          />
        ))}
      </CardLayout>
    </>
  );
}
