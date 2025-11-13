"use client";

import { useRouter } from "next/navigation";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import { ArrowRightIcon, HomeIcon } from "@heroicons/react/20/solid";

export default function Home() {
  const router = useRouter();

  const goToLogin = () => router.push("/login");
  const goToDashboard = () => router.push("/dashboard");

  const actions = [
    {
      title: "Aller au dashboard",
      desc: "Voir les statistiques et gérer le contenu",
      onClick: goToDashboard,
    },
    {
      title: "Se connecter",
      desc: "Accéder à l&apos;espace sécurisé",
      onClick: goToLogin,
    },
    {
      title: "Documentation",
      desc: "Lire la documentation du backoffice",
      onClick: () => router.push("/docs"),
    },
  ];

  return (
    <SceneLayout className="mt-12">
      <Title label="Backoffice - Dev landing" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <section className="md:col-span-2 space-y-6">
          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 flex items-center justify-center rounded-md bg-indigo-50">
                <HomeIcon className="h-10 w-10 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  Bienvenue en développement
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Cette page sert d&apos;atterrissage local pendant le
                  développement. Elle ne sera pas utilisée en production à cause
                  du reverse proxy, mais elle vous permet d&apos;accéder
                  rapidement aux principales routes.
                </p>

                <div className="mt-4 flex gap-3 flex-wrap">
                  <Button onClick={goToDashboard} variant="primary">
                    Aller au dashboard
                  </Button>
                  <Button onClick={goToLogin} variant="secondary">
                    Se connecter
                  </Button>
                  <IconButton
                    icon={ArrowRightIcon}
                    label="Docs"
                    onClick={() => router.push("/docs")}
                    variant="ghost"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
            <h4 className="text-lg font-medium">Actions rapides</h4>
            <p className="text-sm text-gray-600 mt-2">
              Cliquer sur une carte pour naviguer.
            </p>

            <ul className="mt-4 divide-y divide-gray-100 rounded-md border border-gray-50">
              {actions.map((a, idx) => (
                <Card key={idx} onClick={a.onClick}>
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">{a.title}</div>
                        <div className="text-xs text-gray-500">{a.desc}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </ul>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <h5 className="text-sm font-medium">Raccourcis</h5>
            <div className="mt-3 flex flex-col gap-2">
              <Button
                as="a"
                href="/login"
                variant="outline"
                className="w-full text-center"
              >
                Connexion
              </Button>
              <Button
                as="a"
                href="/dashboard"
                variant="outline"
                className="w-full text-center"
              >
                Dashboard
              </Button>
              <Button
                as="a"
                href="/api/logout"
                variant="danger"
                className="w-full text-center"
              >
                Se déconnecter
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <h5 className="text-sm font-medium">À propos</h5>
            <p className="text-xs text-gray-500 mt-2">
              Utilisez cette page pour naviguer rapidement lors du développement
              local. Les boutons utilisent vos composants UI réutilisables.
            </p>
          </div>
        </aside>
      </div>

      <footer className="mt-8 text-center text-xs text-gray-400">
        Dev landing — Ne pas déployer en production.
      </footer>
    </SceneLayout>
  );
}
