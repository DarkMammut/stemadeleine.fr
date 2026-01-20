"use client";

import {useRouter} from "next/navigation";
import {
    ArrowRightIcon,
    ArrowTopRightOnSquareIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    CreditCardIcon,
    EnvelopeIcon,
    NewspaperIcon,
    SparklesIcon,
    UserGroupIcon
} from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";

export default function Home() {
    const router = useRouter();


    const features = [
        {
            icon: ChartBarIcon,
            title: "Tableau de bord",
            description: "Vue d'ensemble des statistiques et activités",
            href: "/dashboard",
            color: "indigo"
        },
        {
            icon: UserGroupIcon,
            title: "Utilisateurs",
            description: "Gestion des comptes et permissions",
            href: "/users",
            color: "blue"
        },
        {
            icon: NewspaperIcon,
            title: "Actualités",
            description: "Publier et gérer les actualités de la paroisse",
            href: "/news",
            color: "purple"
        },
        {
            icon: EnvelopeIcon,
            title: "Contacts",
            description: "Messages et demandes de contact",
            href: "/contacts",
            color: "green"
        },
        {
            icon: CreditCardIcon,
            title: "Paiements",
            description: "Suivi des dons et transactions",
            href: "/payments",
            color: "amber"
        },
        {
            icon: Cog6ToothIcon,
            title: "Paramètres",
            description: "Configuration du site et de l'association",
            href: "/settings",
            color: "gray"
        }
    ];

    const colorClasses = {
        indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100",
        blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
        purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
        green: "bg-green-50 text-green-600 group-hover:bg-green-100",
        amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
        gray: "bg-gray-50 text-gray-600 group-hover:bg-gray-100"
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
            {/* Header avec effet glassmorphism */}
            <div className="relative overflow-hidden bg-white/70 backdrop-blur-sm border-b border-gray-200/50">
                <div className="absolute inset-0 bg-linear-to-r from-indigo-500/10 to-purple-500/10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full"></div>
                                <SparklesIcon className="relative h-16 w-16 text-indigo-600"/>
                            </div>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                            Backoffice
                        </h1>
                        <p className="text-xl text-gray-600 mb-2">
                            Les Amis de Sainte-Madeleine de la Jarrie
                        </p>
                        <p className="text-base text-gray-500 max-w-2xl mx-auto">
                            Espace d&apos;administration pour gérer le contenu du site, les utilisateurs et les
                            activités de
                            l&apos;association
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Button
                                onClick={() => router.push("/auth/login")}
                                variant="primary"
                                className="px-8 py-3 text-base shadow-lg hover:shadow-xl transition-shadow"
                            >
                                Se connecter
                                <ArrowRightIcon className="ml-2 h-5 w-5 inline"/>
                            </Button>
                            <a
                                href="https://stemadeleine.fr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-8 py-3 text-base font-semibold text-indigo-600 bg-white border-2 border-indigo-600 rounded-md shadow-lg hover:bg-indigo-50 hover:shadow-xl transition-all cursor-pointer"
                            >
                                Voir le site principal
                                <ArrowTopRightOnSquareIcon className="ml-2 h-5 w-5"/>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid des fonctionnalités */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="text-center mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                        Fonctionnalités
                    </h2>
                    <p className="text-gray-600">
                        Accédez rapidement aux principales sections du backoffice
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <button
                                key={index}
                                onClick={() => router.push(feature.href)}
                                className="group relative bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 text-left"
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${colorClasses[feature.color]}`}>
                                        <Icon className="h-6 w-6"/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {feature.description}
                                        </p>
                                    </div>
                                    <ArrowRightIcon
                                        className="shrink-0 h-5 w-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"/>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
                <p className="text-sm text-gray-500">
                    © {new Date().getFullYear()} Les Amis de Sainte-Madeleine de la Jarrie
                </p>
            </footer>
        </div>
    );
}
