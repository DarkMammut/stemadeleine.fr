'use client';

import React from 'react';
import Link from 'next/link';
import useGetOrganization from '@/hooks/useGetOrganization';

type OrgAddress = {
    addressLine1?: string;
    addressLine2?: string;
    postCode?: string;
    city?: string;
    country?: string;
};

type OrgLegalInfo = {
    legalForm?: string;
    siret?: string;
    siren?: string;
    vatNumber?: string;
    apeCode?: string;
};

type OrgInfo = {
    name?: string;
    legalInfo?: OrgLegalInfo;
    address?: OrgAddress;
};

type OrgSettings = {
    contactEmail?: string;
    email?: string;
};

function Row({label, value}: { label: string; value?: string | null }) {
    if (!value) return null;
    return (
        <div className="flex flex-col gap-0.5 py-1.5 sm:flex-row sm:gap-3 sm:py-1">
            <dt className="w-full shrink-0 text-sm font-semibold text-primary-dark sm:w-48">
                {label}
            </dt>
            <dd className="text-sm text-primary">{value}</dd>
        </div>
    );
}

function Section({title, children}: { title: string; children: React.ReactNode }) {
    return (
        <section className="border-t border-cream-dark pt-10 first:border-t-0 first:pt-0">
            <h2 className="mb-4 font-serif text-2xl font-normal text-primary-dark">
                {title}
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-primary">{children}</div>
        </section>
    );
}

export default function MentionsLegalesContent() {
    const {info, settings, loading} = useGetOrganization() as unknown as {
        info?: OrgInfo | null;
        settings?: OrgSettings | null;
        loading?: boolean;
    };

    const orgName = info?.name?.trim() || 'Les Amis de Sainte Madeleine de la Jarrie';
    const legal = info?.legalInfo;
    const address = info?.address;
    const contactEmail = settings?.contactEmail || settings?.email;

    const addressLine = address
        ? [
              address.addressLine1,
              address.addressLine2,
              [address.postCode, address.city].filter(Boolean).join(' '),
              address.country,
          ]
              .filter(Boolean)
              .join(', ')
        : undefined;

    return (
        <div className="bg-cream">
            <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
                <p className="mb-12 text-xs uppercase tracking-[0.1em] text-secondary">
                    Dernière mise à jour&nbsp;: septembre 2026
                </p>

                <div className="space-y-10">
                    <Section title="Éditeur du site">
                        <p>
                            Le présent site est édité par l&apos;association {orgName}
                            {legal?.legalForm ? `, ${legal.legalForm}` : ''}.
                        </p>

                        {loading && !info ? (
                            <p className="text-text-light">Chargement des informations…</p>
                        ) : (
                            <dl className="divide-y divide-cream-dark/60 pt-2">
                                <Row label="Association" value={orgName}/>
                                <Row label="Forme juridique" value={legal?.legalForm}/>
                                <Row label="SIRET" value={legal?.siret}/>
                                <Row label="SIREN" value={legal?.siren}/>
                                <Row label="Numéro de TVA intracommunautaire" value={legal?.vatNumber}/>
                                <Row label="Code APE / NAF" value={legal?.apeCode}/>
                                <Row label="Siège social" value={addressLine}/>
                                <Row label="Contact" value={contactEmail}/>
                            </dl>
                        )}
                    </Section>

                    <Section title="Directeur de la publication">
                        <p>
                            La direction de la publication du site est assurée par le représentant légal
                            de l&apos;association {orgName}. Pour toute question relative au contenu du
                            site, vous pouvez nous écrire depuis la{' '}
                            <Link
                                href="/contact"
                                className="text-secondary underline underline-offset-2 hover:text-secondary-dark"
                            >
                                page de contact
                            </Link>
                            {contactEmail ? (
                                <>
                                    {' '}ou à l&apos;adresse{' '}
                                    <a
                                        href={`mailto:${contactEmail}`}
                                        className="text-secondary underline underline-offset-2 hover:text-secondary-dark"
                                    >
                                        {contactEmail}
                                    </a>
                                </>
                            ) : null}
                            .
                        </p>
                    </Section>

                    <Section title="Hébergement">
                        <p>
                            Le site internet (partie visible, front-end) est hébergé par Vercel Inc.
                            Le serveur applicatif (API) est hébergé par Render Services, Inc.
                        </p>
                        <p>
                            Coordonnées complètes de ces hébergeurs disponibles sur{' '}
                            <a
                                href="https://vercel.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary underline underline-offset-2 hover:text-secondary-dark"
                            >
                                vercel.com
                            </a>{' '}
                            et{' '}
                            <a
                                href="https://render.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary underline underline-offset-2 hover:text-secondary-dark"
                            >
                                render.com
                            </a>
                            .
                        </p>
                    </Section>

                    <Section title="Propriété intellectuelle">
                        <p>
                            L&apos;ensemble des contenus présents sur ce site (textes, photographies,
                            logos, mise en page) est, sauf mention contraire, la propriété de
                            l&apos;association {orgName} et est protégé par le droit d&apos;auteur. Toute
                            reproduction, représentation, modification ou adaptation, totale ou partielle,
                            de ces éléments sans autorisation écrite préalable est interdite.
                        </p>
                    </Section>

                    <Section title="Liens hypertextes">
                        <p>
                            Ce site peut contenir des liens vers des sites tiers, notamment vers la
                            plateforme HelloAsso pour les dons et adhésions, ou vers des réseaux sociaux.
                            L&apos;association {orgName} n&apos;exerce aucun contrôle sur le contenu de
                            ces sites tiers et décline toute responsabilité à leur égard.
                        </p>
                    </Section>

                    <Section title="Données personnelles">
                        <p>
                            Les informations relatives à la collecte et au traitement de vos données
                            personnelles sont détaillées dans notre{' '}
                            <Link
                                href="/politique-de-confidentialite"
                                className="text-secondary underline underline-offset-2 hover:text-secondary-dark"
                            >
                                politique de confidentialité
                            </Link>
                            .
                        </p>
                    </Section>
                </div>
            </div>
        </div>
    );
}
