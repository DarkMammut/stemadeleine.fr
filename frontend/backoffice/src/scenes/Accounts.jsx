"use client";

import React, { useEffect, useState } from "react";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import CardList from "@/components/ui/CardList";
import Card from "@/components/ui/Card";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useAccountOperations } from "@/hooks/useAccountOperations";
import { useUserOperations } from "@/hooks/useUserOperations";
import { isAdminUser } from "@/utils/roles";
import { useRouter, useSearchParams } from "next/navigation";

export default function Accounts() {
  const { notification, showError, hideNotification } = useNotification();
  const accountOps = useAccountOperations();
  const { getCurrentUser } = useUserOperations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshParam = searchParams?.get("r");
  // selectedId can be provided in the query string (e.g. ?selected=<id>) to mark a card
  // Use searchParams if available (app router), otherwise fallback to window.location for robustness
  let selectedId = null;
  try {
    selectedId = searchParams?.get("selected") || null;
  } catch (e) {
    // ignore
  }
  if (!selectedId && typeof window !== "undefined") {
    try {
      const params = new URLSearchParams(window.location.search);
      selectedId = params.get("selected") || null;
    } catch (e) {
      selectedId = null;
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const u = await getCurrentUser();
        if (!isAdminUser(u)) return;
        const list = await accountOps.getAllAccounts();
        setAccounts(list || []);
      } catch (e) {
        showError("Erreur de chargement", "Impossible de charger les comptes");
      } finally {
        setLoading(false);
      }
    })();

    return () => hideNotification();
  }, [refreshParam]);

  // show header + utilities and skeleton to avoid flashes
  return (
    <SceneLayout>
      <Title label="Comptes" />

      <div className="space-y-6">
        {loading ? (
          <div className="mt-4">
            <LoadingSkeleton variant="card" count={6} showActions={false} />
          </div>
        ) : (
          <CardList emptyMessage={"Aucun compte trouvé."}>
            {(accounts || []).map((acc) => (
              <Card
                key={acc.id}
                onClick={() => router.push(`/settings/accounts/${acc.id}`)}
                className={acc.id === selectedId ? "bg-blue-50" : ""}
              >
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {acc.email}
                  </div>
                  <div className="text-sm text-gray-500">
                    {acc.provider || "local"}
                  </div>
                  <div className="text-sm text-gray-500">{acc.role}</div>
                </div>
              </Card>
            ))}
          </CardList>
        )}
      </div>

      {notification.show && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
    </SceneLayout>
  );
}
