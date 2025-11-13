"use client";

import React, { useEffect, useState } from "react";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import CardList from "@/components/CardList";
import Card from "@/components/ui/Card";
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
  const [currentUser, setCurrentUser] = useState(null);

  const refreshParam = searchParams?.get("r");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const u = await getCurrentUser();
        setCurrentUser(u);
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

  if (loading) return <div>Chargement...</div>;

  if (!isAdminUser(currentUser)) {
    return (
      <SceneLayout>
        <Title label="Comptes" />
        <div className="text-gray-600">Accès non autorisé.</div>
      </SceneLayout>
    );
  }

  const selectedId = searchParams?.get("selected");

  return (
    <SceneLayout>
      <Title label="Comptes" />

      <div className="space-y-6">
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
