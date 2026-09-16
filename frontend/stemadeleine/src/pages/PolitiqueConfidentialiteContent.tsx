'use client';

import React from 'react';
import useGetOrganization from '@/hooks/useGetOrganization';

type OrgInfo = {
    name?: string;
};

type OrgSettings = {
    contactEmail?: string;
    email?: string;
};

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

export default function PolitiqueConfidentialiteContent() {
    const {info, settings} = useGetOrganization() as unknown as {
        info?: OrgInfo | null;
        settings?: OrgSettings | null;
    };

    const orgName = info?.name?.trim() || 'Les Amis de Sainte Madeleine de la Jarrie';
    const contactEmail = settings?.contactEmail || settings?.email || 'contact@stemadeleine.fr';

    return (
        <div className="bg-cream">
            <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
                <p className="mb-12 text-xs uppercase tracking-[0.1em] text-secondary">
                    Dernière mise à jour&nbsp;: septembre 2026
                </p>

                <div className="space-y-10">
                    <Section title="Préambule">
                        <p>
                            L&apos;association {orgName} attache une grande importance à la protection
                            de vos données personnelles. Cette politique de confidentialité explique
                            quelles informations nous collectons sur ce site, pourquoi, et comment vous
                            pouvez exercer vos droits, conformément au Règlement Général sur la
                            Protection des Données (RGPD) et à la loi Informatique et Libertés.
                        </p>
                    </Section>

                    <Section title="Responsable du traitement">
                        <p>
                            Le responsable du traitement des données collectées sur ce site est
                            l&apos;association {orgName}. Nous n&apos;avons pas désigné de Délégué à la
                            Protection des Données (DPO) à titre officiel ; toute question ou demande
                            relative à vos données personnelles est traitée directement par
                            l&apos;association, à l&apos;adresse{' '}
                            <a
                                href={`mailto:${contactEmail}`}
                                className="text-secondary underline underline-offset-2 hover:text-secondary-dark"
                            >
                                {contactEmail}
                            </a>
                            .
                        </p>
                    </Section>

                    <Section title="Données que nous collectons">
                        <p>
                            <span className="font-semibold text-primary-dark">
                                Formulaire de contact —{' '}
                            </span>
                            lorsque vous nous écrivez via le formulaire de contact, nous collectons votre
                            nom, prénom, adresse email et le contenu de votre message, afin de pouvoir
                            vous répondre.
                        </p>
                        <p>
                            <span className="font-semibold text-primary-dark">
                                Inscription à la newsletter —{' '}
                            </span>
                            si vous vous inscrivez à notre lettre d&apos;information, nous conservons
                            votre adresse email dans le seul but de vous envoyer nos actualités. L&apos;envoi
                            effectif de la newsletter n&apos;est pas encore actif à ce jour ; lorsqu&apos;il le
                            sera, il pourra être réalisé via l&apos;outil Brevo, auquel cas votre adresse
                            email sera transmise à ce prestataire pour les seuls besoins de l&apos;envoi.
                            Vous pourrez vous désinscrire à tout moment.
                        </p>
                        <p>
                            <span className="font-semibold text-primary-dark">
                                Dons et adhésions (HelloAsso) —{' '}
                            </span>
                            les dons et adhésions sont réalisés via les formulaires de la plateforme
                            HelloAsso. Les informations que vous y renseignez (identité, coordonnées, et
                            selon le cas informations de paiement traitées directement par HelloAsso) nous
                            sont ensuite communiquées et enregistrées dans nos outils de gestion, afin de
                            suivre les adhésions, les dons, et d&apos;émettre les reçus correspondants le
                            cas échéant. Nous ne stockons jamais vos coordonnées bancaires.
                        </p>
                    </Section>

                    <Section title="Cookies et traceurs">
                        <p>
                            Ce site n&apos;utilise, pour son propre compte, aucun cookie de mesure
                            d&apos;audience, de publicité ou de traçage.
                        </p>
                        <p>
                            En revanche, deux services tiers intégrés à ce site peuvent, de leur côté,
                            déposer des cookies&nbsp;:
                        </p>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>
                                <span className="font-semibold text-primary-dark">Google reCAPTCHA</span>,
                                utilisé sur le formulaire de contact pour le protéger des soumissions
                                automatisées (spam). Ce service peut déposer des cookies techniques
                                propres à Google.
                            </li>
                            <li>
                                <span className="font-semibold text-primary-dark">Google Maps</span>, dont
                                une carte est intégrée sur la page de contact pour vous indiquer notre
                                localisation. Le chargement de cette carte peut également entraîner le
                                dépôt de cookies par Google.
                            </li>
                        </ul>
                        <p>
                            Ces services sont soumis à la politique de confidentialité de Google,
                            disponible sur{' '}
                            <a
                                href="https://policies.google.com/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary underline underline-offset-2 hover:text-secondary-dark"
                            >
                                policies.google.com/privacy
                            </a>
                            .
                        </p>
                    </Section>

                    <Section title="Durée de conservation">
                        <p>
                            Aucune durée de conservation automatique n&apos;a été définie pour l&apos;instant
                            : vos données sont conservées le temps nécessaire à la gestion de votre
                            demande, de votre adhésion ou de votre don. Vous pouvez à tout moment nous
                            demander la suppression de vos informations ; nous nous engageons à donner
                            suite à toute demande en ce sens dans les meilleurs délais.
                        </p>
                    </Section>

                    <Section title="Destinataires de vos données">
                        <p>
                            Vos données sont destinées aux membres de l&apos;association en charge de leur
                            traitement, et sont partagées, uniquement dans la mesure nécessaire, avec nos
                            prestataires techniques&nbsp;: HelloAsso (traitement des dons et adhésions),
                            nos hébergeurs (Vercel et Render), et, une fois l&apos;envoi de newsletter
                            activé, Brevo. Ces prestataires n&apos;utilisent vos données que pour les
                            besoins des services qu&apos;ils nous fournissent.
                        </p>
                    </Section>

                    <Section title="Vos droits">
                        <p>
                            Conformément à la réglementation applicable, vous disposez d&apos;un droit
                            d&apos;accès, de rectification, d&apos;effacement et de limitation du
                            traitement de vos données, ainsi que d&apos;un droit d&apos;opposition et de
                            portabilité. Vous pouvez exercer ces droits en nous écrivant à{' '}
                            <a
                                href={`mailto:${contactEmail}`}
                                className="text-secondary underline underline-offset-2 hover:text-secondary-dark"
                            >
                                {contactEmail}
                            </a>{' '}
                            ou via notre{' '}
                            <a
                                href="/contact"
                                className="text-secondary underline underline-offset-2 hover:text-secondary-dark"
                            >
                                page de contact
                            </a>
                            . Vous disposez également du droit d&apos;introduire une réclamation auprès de
                            la Commission Nationale de l&apos;Informatique et des Libertés (CNIL).
                        </p>
                    </Section>

                    <Section title="Sécurité">
                        <p>
                            Nous mettons en œuvre des mesures techniques et organisationnelles
                            raisonnables pour protéger vos données contre l&apos;accès non autorisé, la
                            perte ou l&apos;altération.
                        </p>
                    </Section>

                    <Section title="Modification de cette politique">
                        <p>
                            Cette politique de confidentialité peut être amenée à évoluer, notamment lors
                            de la mise en service de l&apos;envoi de newsletter. Nous vous invitons à la
                            consulter régulièrement.
                        </p>
                    </Section>
                </div>
            </div>
        </div>
    );
}
