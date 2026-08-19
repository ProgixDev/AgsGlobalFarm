import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { storeInfo } from "@/lib/store-info";

/**
 * Dedicated account-deletion page, distinct from the general privacy policy.
 * Google Play's Data Safety form requires the "Delete account URL" to
 * PROMINENTLY feature the deletion steps — a section buried in a long,
 * multi-topic privacy policy does not reliably satisfy that bar, so this
 * page exists solely to be that unambiguous, single-purpose destination.
 */

export const metadata: Metadata = {
  title: "Supprimer mon compte | AGS Globalfarm SARL",
  description:
    "Comment demander la suppression de votre compte AGS Globalfarm et de vos données personnelles.",
  alternates: { canonical: "/suppression-de-compte" },
};

const DELETE_EMAIL = storeInfo.email;
const DELETE_SUBJECT = "Demande de suppression de compte";
const MAILTO = `mailto:${DELETE_EMAIL}?subject=${encodeURIComponent(DELETE_SUBJECT)}`;

const DELETED_ITEMS = [
  "Votre profil (nom, e-mail, téléphone, genre, photo)",
  "Vos parcelles enregistrées dans Ma Ferme",
  "Vos signalements d'incidents et leurs photos",
  "Vos offres d'emploi publiées et les candidatures reçues",
  "Vos candidatures envoyées à des offres d'emploi",
  "Votre progression de formation et vos résultats de quiz",
];

const RETAINED_ITEMS = [
  {
    what: "Justificatifs de commande (montant, date, articles)",
    why: "conservés pour la durée requise par la réglementation comptable et fiscale sénégalaise",
  },
];

export default function SuppressionDeComptePage() {
  return (
    <div className="min-h-screen">
      <section className="bg-green-50 border-b border-green-100">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-green-700 text-sm font-semibold mb-6">
              <Trash2 className="w-4 h-4" />
              Suppression de compte
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Supprimer mon compte
            </h1>
            <p className="text-lg text-muted-foreground">
              Vous pouvez demander la suppression de votre compte{" "}
              {storeInfo.name} et des données associées à tout moment.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Comment faire la demande
            </h2>
            <ol className="list-decimal pl-5 space-y-3 text-base leading-7 text-muted-foreground">
              <li>
                Envoyez un e-mail à{" "}
                <a
                  href={MAILTO}
                  className="text-green-700 font-medium hover:underline"
                >
                  {DELETE_EMAIL}
                </a>{" "}
                depuis l&apos;adresse associée à votre compte, avec pour objet
                « {DELETE_SUBJECT} ».
              </li>
              <li>
                Nous vérifions que la demande provient bien du titulaire du
                compte.
              </li>
              <li>
                La suppression est effectuée sous <strong>30 jours</strong>.
              </li>
            </ol>
            <div className="mt-6">
              <a
                href={MAILTO}
                className="inline-flex items-center gap-2 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 transition-colors"
              >
                Demander la suppression de mon compte
              </a>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Données supprimées
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-base leading-7 text-muted-foreground">
              {DELETED_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Données conservées
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-base leading-7 text-muted-foreground">
              {RETAINED_ITEMS.map((item) => (
                <li key={item.what}>
                  {item.what} — {item.why}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Supprimer une partie de vos données sans fermer votre compte
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              Vous pouvez aussi supprimer vous-même, à tout moment et
              directement depuis l&apos;application, sans passer par cette
              demande : vos parcelles (Ma Ferme), vos signalements
              d&apos;incident, et les offres d&apos;emploi que vous avez
              publiées.
            </p>
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
