// Component de test pour vérifier les couleurs des boutons
import React from "react";
import Button from "./Button";
import IconButton from "./IconButton";
import useOrganizationTheme from "../hooks/useOrganizationTheme";

// Icône de test simple
const TestIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

export default function ButtonTest() {
  const { themeLoaded, colors } = useOrganizationTheme();

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Test des couleurs de boutons
        </h2>
        <div className="mb-4">
          <p>
            <strong>Thème chargé :</strong> {themeLoaded ? "✅ Oui" : "❌ Non"}
          </p>
          <p>
            <strong>Couleur primaire :</strong>{" "}
            {colors?.primary || "Non définie"}
          </p>
          <p>
            <strong>Couleur secondaire :</strong>{" "}
            {colors?.secondary || "Non définie"}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Boutons Standard</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="outline">Outline</Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Boutons avec Icônes</h3>
        <div className="flex flex-wrap gap-4">
          <IconButton icon={TestIcon} label="Primary" variant="primary" />
          <IconButton icon={TestIcon} label="Secondary" variant="secondary" />
          <IconButton icon={TestIcon} label="Outline" variant="outline" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Différentes Tailles</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="md">
            Medium
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
          <Button variant="primary" size="xl">
            Extra Large
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">États des Boutons</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Normal</Button>
          <Button variant="primary" loading>
            Loading
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </div>

      {/* Debug des variables CSS */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Debug Variables CSS</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium">Couleurs Primaires</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: "rgb(var(--color-primary-500))" }}
                ></div>
                <span>primary-500</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: "rgb(var(--color-primary-600))" }}
                ></div>
                <span>primary-600</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: "rgb(var(--color-primary-700))" }}
                ></div>
                <span>primary-700</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium">Couleurs Secondaires</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: "rgb(var(--color-secondary-100))" }}
                ></div>
                <span>secondary-100</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: "rgb(var(--color-secondary-500))" }}
                ></div>
                <span>secondary-500</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: "rgb(var(--color-secondary-700))" }}
                ></div>
                <span>secondary-700</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
