import type { Metadata } from "next";
import Link from "next/link";
import { Eraser } from "lucide-react";
import { storeInfo } from "@/lib/store-info";

/**
 * Dedicated "delete data" page for Google Play's Data Safety form, distinct
 * from /suppression-de-compte (full account closure). This one documents
 * deleting SOME data while keeping the account, matching what the app
 * actually supports: three self-service delete endpoints (farms, incidents,
 * jobs) plus an email path for everything else. Must PROMINENTLY feature the
 * steps and state what's deleted/kept — a passing mention on another page
 * does not satisfy that bar.
 */

export const metadata: Metadata = {
  title: "Supprimer mes données | GrowFarm",
  description:
    "Comment supprimer certaines de vos données sur GrowFarm sans fermer votre compte.",
  alternates: { canonical: "/suppression-de-donnees" },
};

const SUPPORT_EMAIL = storeInfo.email;
const SUBJECT = "Demande de suppression de données";
const MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUBJECT)}`;

const SELF_SERVICE = [
  {
    what: "Une parcelle (Ma Ferme)",
    steps: [
      'Ouvrez l\'application, allez dans "Ma Ferme"',
      "Sélectionnez la parcelle concernée",
      'Appuyez sur "Supprimer la ferme" et confirmez',
    ],
  },
  {
    what: "Un signalement d'incident",
    steps: [
      'Ouvrez l\'application, allez dans "Profil" puis "Mes incidents"',
      "Sélectionnez le signalement concerné",
      'Appuyez sur "Supprimer cet incident" et confirmez',
    ],
  },
  {
    what: "Une offre d'emploi publiée",
    steps: [
      "Ouvrez l'application, allez dans le détail de l'offre concernée",
      'Appuyez sur "Supprimer" et confirmez',
    ],
  },
];

const EMAIL_ONLY = [
  "Une commande passée sur la boutique",
  "Votre progression ou vos résultats de quiz sur une formation",
  "Une candidature envoyée à une offre d'emploi",
  "Des informations de votre profil (téléphone, genre, photo)",
];

const RETAINED = [
  {
    what: "Justificatifs de commande",
    why: "conservés pour la durée requise par la réglementation comptable et fiscale sénégalaise, même après suppression",
  },
];

export default function SuppressionDeDonneesPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-green-50 border-b border-green-100">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-green-700 text-sm font-semibold mb-6">
              <Eraser className="w-4 h-4" />
              Suppression de données
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Supprimer mes données
            </h1>
            <p className="text-lg text-muted-foreground">
              Vous pouvez supprimer certaines de vos données sur{" "}
              {storeInfo.name} sans fermer votre compte. Pour fermer
              entièrement votre compte, consultez plutôt{" "}
              <Link
                href="/suppression-de-compte"
                className="text-green-700 font-medium hover:underline"
              >
                cette page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Directement depuis l&apos;application
            </h2>
            <p className="text-base leading-7 text-muted-foreground mb-6">
              Ces suppressions sont immédiates, sans attente et sans nous
              contacter.
            </p>
            <div className="space-y-6">
              {SELF_SERVICE.map((item) => (
                <div
                  key={item.what}
                  className="bg-white border border-gray-200 rounded-2xl p-5"
                >
                  <h3 className="font-semibold text-foreground mb-3">
                    {item.what}
                  </h3>
                  <ol className="list-decimal pl-5 space-y-1.5 text-sm leading-6 text-muted-foreground">
                    {item.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Sur demande par e-mail
            </h2>
            <p className="text-base leading-7 text-muted-foreground mb-4">
              Ces données n&apos;ont pas encore de suppression en libre-service
              dans l&apos;application. Écrivez à{" "}
              <a
                href={MAILTO}
                className="text-green-700 font-medium hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              depuis l&apos;adresse associée à votre compte, en précisant la
              donnée concernée. Nous traitons la demande sous{" "}
              <strong>30 jours</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-base leading-7 text-muted-foreground mb-6">
              {EMAIL_ONLY.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a
              href={MAILTO}
              className="inline-flex items-center gap-2 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 transition-colors"
            >
              Demander la suppression d&apos;une donnée
            </a>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Données conservées
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-base leading-7 text-muted-foreground">
              {RETAINED.map((item) => (
                <li key={item.what}>
                  {item.what} — {item.why}
                </li>
              ))}
            </ul>
          </section>

          <p className="text-sm text-muted-foreground">
            Pour le détail complet de nos pratiques de traitement des
            données, consultez notre{" "}
            <Link
              href="/politique-de-confidentialite"
              className="text-green-700 font-medium hover:underline"
            >
              politique de confidentialité
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
