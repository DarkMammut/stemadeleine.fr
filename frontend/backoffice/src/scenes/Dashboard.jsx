import Campaigns from "@/components/Campaigns";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import React from "react";
import KpiCards from "@/components/ui/KpiCards";
import { usePaymentOperations } from "@/hooks/usePaymentOperations";
import { useUserOperations } from "@/hooks/useUserOperations";
import DonationsChart from "@/components/DonationsChart";
import { useAxiosClient } from "@/utils/axiosClient";
import Utilities from "@/components/ui/Utilities";

export default function Dashboard() {
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();
  const { getAllPayments } = usePaymentOperations();
  const { getAllUsers } = useUserOperations();
  const axios = useAxiosClient();

  const [kpis, setKpis] = React.useState({
    activeMembers: 0,
    membershipAmount: 0,
    donorsCount: 0,
    donationsAmount: 0,
    loading: true,
  });

  const [campaignsRefreshCounter, setCampaignsRefreshCounter] =
    React.useState(0);

  // New: dashboard refresh counter to signal KPI and chart reloads
  const [dashboardRefreshCounter, setDashboardRefreshCounter] =
    React.useState(0);

  const handleImportHelloAsso = async () => {
    try {
      await axios.post("/api/helloasso/import");
      // bump counter to signal Campaigns to refetch
      setCampaignsRefreshCounter((c) => c + 1);
      // also bump dashboard counter to refresh KPIs and charts
      setDashboardRefreshCounter((c) => c + 1);
      showSuccess?.(
        "Import HelloAsso terminé",
        "Les données ont été mises à jour avec succès",
      );
    } catch (e) {
      console.error("Erreur import HelloAsso", e);
      showError?.(
        "Erreur d'import",
        "Impossible d'importer les données HelloAsso",
      );
      throw e;
    }
  };

  React.useEffect(() => {
    let mounted = true;
    const loadKpis = async () => {
      try {
        // Prefer server-side aggregated KPIs
        const res = await axios.get("/api/stats/dashboard");
        const data = res.data || {};

        const membersCount = data.activeMembers || 0;
        const membershipAmount = data.membershipAmount || 0;
        const donationsAmount = data.donationsAmount || 0;
        const donorsCount = data.donorsCount || 0;

        if (!mounted) return;
        setKpis({
          activeMembers: membersCount,
          membershipAmount,
          donorsCount,
          donationsAmount,
          loading: false,
        });
      } catch (e) {
        console.error("Erreur chargement KPI dashboard", e);
        if (mounted) setKpis((k) => ({ ...k, loading: false }));
      }
    };
    loadKpis();
    return () => (mounted = false);
  }, [getAllPayments, getAllUsers, dashboardRefreshCounter]);

  return (
    <SceneLayout>
      <Title label="Dashboard" />

      {/* Utilities with refresh hover-expand under Title (reduced spacing) */}
      <div className="space-y-10">
        <Utilities
          actions={[
            {
              variant: "refresh",
              label: "Actualiser HelloAsso",
              callback: handleImportHelloAsso,
              hoverExpand: true,
              size: "md",
            },
            {
              variant: "link",
              label: "SteMadeleine.fr",
              callback: () =>
                window.open(
                  "https://stemadeleine.fr",
                  "_blank",
                  "noopener,noreferrer",
                ),
              size: "md",
            },
            {
              variant: "link",
              label: "HelloAsso.com",
              callback: () =>
                window.open(
                  "https://admin.helloasso.com/les-amis-de-sainte-madeleine-de-la-jarrie/formulaires",
                  "_blank",
                  "noopener,noreferrer",
                ),
              size: "md",
            },
          ]}
        />

        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-10">
          {/* Graph Section - increase inner chart height only via chartHeight prop */}
          <DonationsChart
            className={
              "col-span-2 h-96 rounded-2xl shadow-md bg-blue-50 px-3 py-4"
            }
            chartHeight="h-60"
            // pass refresh signal so chart reloads after import
            refreshSignal={dashboardRefreshCounter}
          />

          {/* KPI Cards */}
          <KpiCards kpis={kpis} containerClass={"h-96"} />
        </div>

        <Campaigns
          onNotifySuccess={showSuccess}
          onNotifyError={showError}
          refreshSignal={campaignsRefreshCounter}
        />
      </div>

      <Notification
        show={notification.show}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </SceneLayout>
  );
}
