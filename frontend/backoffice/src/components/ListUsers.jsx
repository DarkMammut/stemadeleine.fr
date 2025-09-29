"use client";

import React from "react";
import Flag from "@/components/ui/Flag";

export default function ListUsers({ users, onUserClick, showAdherentFlag }) {
  return (
    <div className="bg-surface border border-border rounded-lg">
      {!users || users.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          <p>Aucun utilisateur trouvé.</p>
          <p className="text-sm mt-2">
            Cliquez sur "Nouvel Utilisateur" pour commencer.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {users.map((user) => (
            <div
              key={user.id}
              className="p-4 hover:bg-surface-hover transition-colors cursor-pointer"
              onClick={() => onUserClick(user.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-text">
                      {user.firstname} {user.lastname}
                    </h3>
                    {showAdherentFlag && user.isAdherent && (
                      <Flag variant="primary" size="sm" className="ml-2">
                        Adhérent
                      </Flag>
                    )}
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-text-muted mb-3">
                    <span>
                      Email :{" "}
                      {user.email || (
                        <span className="italic text-gray-400">
                          Non renseigné
                        </span>
                      )}
                    </span>
                    <span>
                      Téléphone :{" "}
                      {user.phoneMobile || user.phoneLandline || (
                        <span className="italic text-gray-400">
                          Non renseigné
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
