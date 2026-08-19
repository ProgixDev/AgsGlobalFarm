import type { Metadata } from "next";
import Link from "next/link";
import { Shield } from "lucide-react";
import { storeInfo } from "@/lib/store-info";

/**
 * Public privacy policy. Both the App Store and Google Play require a live,
 * publicly reachable URL for this page, so it must stay outside the
 * authenticated area and must not be disallowed in robots.ts.
 */

export const metadata: Metadata = {
  title: "Politique de confidentialité | AGS Globalfarm SARL",
  description:
    "Comment AGROPASTORAL GLOBALE FARMS SARL collecte, utilise et protège vos données personnelles sur le site et l'application mobile AGS.",
  alternates: { canonical: "/politique-de-confidentialite" },
};

const LAST_UPDATED = "19 août 2026";
const PRIVACY_EMAIL = storeInfo.email;

interface DataRow {
  category: string;
  items: string;
  purpose: string;
  basis: string;
}

const DATA_ROWS: DataRow[] = [
  {
    category: "Compte et identité",
    items:
      "Prénom, nom, adresse e-mail, numéro de téléphone, genre (facultatif), type de compte (exploitant agricole ou chercheur d'emploi), photo de profil (facultative), mot de passe sous forme chiffrée.",
    purpose:
      "Créer et sécuriser votre compte, vérifier votre adresse e-mail, vous permettre de vous connecter.",
    basis: "Exécution du contrat",
  },
  {
    category: "Session et connexion",
    items:
      "Jeton de session, date d'expiration, adresse IP et type d'appareil ou de navigateur au moment de la connexion.",
    purpose:
      "Maintenir votre session ouverte, détecter les accès frauduleux, sécuriser le service.",
    basis: "Intérêt légitime (sécurité)",
  },
  {
    category: "Ma Ferme (localisation)",
    items:
      "Nom de l'exploitation, coordonnées GPS du point ou du contour de la parcelle, superficie, type de production, cultures en cours, contact renseigné.",
    purpose:
      "Afficher votre exploitation sur la carte, calculer les superficies, personnaliser les conseils agricoles.",
    basis: "Consentement",
  },
  {
    category: "Signalements d'incidents",
    items:
      "Nom du déclarant, catégorie, titre, description, niveau de gravité, coordonnées GPS, région et photos jointes.",
    purpose:
      "Publier l'alerte sur la carte communautaire et permettre son suivi jusqu'à résolution.",
    basis: "Consentement",
  },
  {
    category: "Emploi et candidatures",
    items:
      "Pour les offres : intitulé, exploitation, localisation, type de contrat, rémunération. Pour les candidatures : nom, e-mail, téléphone, adresse, région et département, formation, expérience, poste recherché, prétentions salariales et lettre de motivation.",
    purpose:
      "Publier les offres et transmettre votre candidature à l'exploitant concerné.",
    basis: "Exécution du contrat",
  },
  {
    category: "Commandes et paiements",
    items:
      "Articles commandés, montant, adresse de livraison, statut du paiement, référence de transaction, lien du reçu, ainsi que le nom, l'e-mail et le téléphone transmis par PayDunya.",
    purpose:
      "Traiter votre commande, émettre le reçu et assurer le suivi et le service après-vente.",
    basis: "Exécution du contrat / obligation légale (comptabilité)",
  },
  {
    category: "Formations",
    items:
      "Formations acquises, leçons terminées, réponses aux quiz, scores, nombre de tentatives et certificats délivrés.",
    purpose:
      "Suivre votre progression, calculer vos résultats et générer votre certificat.",
    basis: "Exécution du contrat",
  },
];

interface Recipient {
  name: string;
  role: string;
  where: string;
}

const RECIPIENTS: Recipient[] = [
  {
    name: "Vercel",
    role: "Hébergement du site et de l'API.",
    where: "États-Unis / Union européenne",
  },
  {
    name: "MongoDB Atlas",
    role: "Base de données hébergée.",
    where: "Union européenne",
  },
  {
    name: "PayDunya",
    role: "Traitement des paiements. Vos données bancaires sont saisies chez PayDunya et ne transitent jamais par nos serveurs.",
    where: "Sénégal",
  },
  {
    name: "Cloudinary",
    role: "Stockage et diffusion des photos (avatars, incidents, produits).",
    where: "États-Unis / Union européenne",
  },
  {
    name: "Mapbox",
    role: "Fonds de carte affichés dans l'application. Les coordonnées consultées transitent par Mapbox pour le rendu.",
    where: "États-Unis",
  },
  {
    name: "Google (Gmail SMTP)",
    role: "Acheminement des e-mails transactionnels (vérification, réinitialisation, confirmation de commande, certificat).",
    where: "États-Unis / Union européenne",
  },
];

interface Retention {
  what: string;
  how_long: string;
}

const RETENTION: Retention[] = [
  {
    what: "Compte et profil",
    how_long:
      "Conservés tant que le compte existe. Aucune suppression automatique n'est appliquée : les données sont effacées à votre demande (voir la section 9).",
  },
  {
    what: "Sessions de connexion",
    how_long:
      "Expiration automatique 30 jours après la dernière connexion. Vous pouvez y mettre fin plus tôt en vous déconnectant.",
  },
  {
    what: "Parcelles (Ma Ferme) et signalements d'incidents",
    how_long:
      "Conservés jusqu'à ce que vous les supprimiez vous-même depuis l'application, ou jusqu'à la suppression de votre compte.",
  },
  {
    what: "Offres d'emploi et candidatures",
    how_long:
      "Une offre est conservée jusqu'à sa suppression par l'exploitant qui l'a publiée ; les candidatures qui s'y rattachent sont alors supprimées avec elle. Vous pouvez aussi demander le retrait de votre candidature.",
  },
  {
    what: "Photos jointes à un signalement",
    how_long:
      "Le signalement est supprimé immédiatement, mais la photo peut subsister chez notre hébergeur d'images pendant une période transitoire, jusqu'à sa purge sur demande.",
  },
  {
    what: "Commandes et pièces comptables",
    how_long:
      "Conservées pendant la durée requise par la réglementation comptable et fiscale sénégalaise, y compris après la suppression du compte.",
  },
  {
    what: "Formations, résultats de quiz et certificats",
    how_long:
      "Conservés tant que le compte existe, afin de vous permettre de justifier vos acquis et de retélécharger votre certificat.",
  },
  {
    what: "Codes de vérification et de réinitialisation",
    how_long:
      "10 minutes pour un code, 5 minutes pour l'enregistrement anti-abus associé, puis effacement automatique.",
  },
];

const RIGHTS = [
  "Droit d'accès : obtenir la confirmation que vos données sont traitées et en recevoir une copie.",
  "Droit de rectification : corriger des données inexactes ou incomplètes.",
  "Droit d'opposition : vous opposer à un traitement fondé sur notre intérêt légitime.",
  "Droit de suppression : demander l'effacement de vos données et la clôture de votre compte.",
  "Droit au retrait du consentement : retirer à tout moment un consentement donné, sans effet sur les traitements déjà réalisés.",
  "Droit à la portabilité : recevoir vos données dans un format lisible par machine.",
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
        {title}
      </h2>
      <div className="space-y-4 text-base leading-7 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export default function PolitiqueDeConfidentialitePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-green-50 border-b border-green-100">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-green-700 text-sm font-semibold mb-6">
              <Shield className="w-4 h-4" />
              Vos données
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Politique de confidentialité
            </h1>
            <p className="text-lg text-muted-foreground">
              Cette politique explique quelles données personnelles nous
              collectons sur le site {storeInfo.name} et dans l&apos;application
              mobile AGS, pourquoi nous les collectons, avec qui nous les
              partageons et comment exercer vos droits.
            </p>
            <p className="text-sm text-muted-foreground mt-6">
              Dernière mise à jour : {LAST_UPDATED}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl space-y-12">
          <Section id="responsable" title="1. Qui est responsable du traitement">
            <p>
              Le responsable du traitement est{" "}
              <strong className="text-foreground">
                AGROPASTORAL GLOBALE FARMS SARL
              </strong>
              , société de droit sénégalais dont le siège est situé{" "}
              {storeInfo.addressLines.join(", ")}, Sénégal.
            </p>
            <p>
              Pour toute question relative à vos données personnelles :{" "}
              <a
                href={`mailto:${PRIVACY_EMAIL}`}
                className="text-green-700 font-medium hover:underline"
              >
                {PRIVACY_EMAIL}
              </a>{" "}
              — {storeInfo.phone}.
            </p>
          </Section>

          <Section id="champ" title="2. Champ d'application">
            <p>
              Cette politique couvre le site {storeInfo.name} ainsi que
              l&apos;application mobile AGS pour Android et iOS. Les deux
              utilisent le même compte et la même base de données.
            </p>
            <p>
              Nous n&apos;utilisons ni régie publicitaire, ni outil de mesure
              d&apos;audience, ni traceur tiers. Nous ne vendons ni ne louons vos
              données à qui que ce soit, et aucune décision automatisée
              produisant des effets juridiques à votre égard n&apos;est prise.
            </p>
          </Section>

          <Section id="donnees" title="3. Données collectées et finalités">
            <p>
              Nous ne collectons que les données nécessaires aux fonctionnalités
              que vous utilisez. Si vous n&apos;utilisez pas une fonctionnalité,
              les données correspondantes ne sont pas collectées.
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[640px] text-sm text-left">
                <thead className="bg-gray-50 text-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Catégorie</th>
                    <th className="px-4 py-3 font-semibold">Données</th>
                    <th className="px-4 py-3 font-semibold">Finalité</th>
                    <th className="px-4 py-3 font-semibold">Base légale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {DATA_ROWS.map((row) => (
                    <tr key={row.category} className="align-top">
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                        {row.category}
                      </td>
                      <td className="px-4 py-3">{row.items}</td>
                      <td className="px-4 py-3">{row.purpose}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {row.basis}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section
            id="autorisations"
            title="4. Autorisations demandées par l'application mobile"
          >
            <p>
              L&apos;application ne demande une autorisation qu&apos;au moment où
              la fonctionnalité concernée est utilisée. Vous pouvez la refuser ou
              la révoquer à tout moment dans les réglages de votre téléphone ; le
              reste de l&apos;application continue de fonctionner.
            </p>
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <strong className="text-foreground">
                  Position GPS (pendant l&apos;utilisation)
                </strong>{" "}
                — sert à situer votre exploitation dans « Ma Ferme », à
                positionner un signalement d&apos;incident et à centrer la carte.
                Votre position n&apos;est jamais collectée en arrière-plan et
                n&apos;est enregistrée que lorsque vous validez explicitement une
                parcelle ou un signalement.
              </li>
              <li>
                <strong className="text-foreground">Photothèque</strong> — sert à
                choisir votre photo de profil et à joindre des photos à un
                signalement. Nous n&apos;accédons qu&apos;aux images que vous
                sélectionnez vous-même, jamais à l&apos;ensemble de votre
                galerie.
              </li>
            </ul>
            <p>
              Votre jeton de session est stocké de façon chiffrée sur votre
              appareil et n&apos;est transmis qu&apos;à nos serveurs.
            </p>
          </Section>

          <Section id="destinataires" title="5. Destinataires et sous-traitants">
            <p>
              Vos données sont accessibles à notre personnel habilité et aux
              prestataires techniques ci-dessous, uniquement pour ce qui est
              nécessaire à leur mission.
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[560px] text-sm text-left">
                <thead className="bg-gray-50 text-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Prestataire</th>
                    <th className="px-4 py-3 font-semibold">Rôle</th>
                    <th className="px-4 py-3 font-semibold">Hébergement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {RECIPIENTS.map((r) => (
                    <tr key={r.name} className="align-top">
                      <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                        {r.name}
                      </td>
                      <td className="px-4 py-3">{r.role}</td>
                      <td className="px-4 py-3">{r.where}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Lorsque vous candidatez à une offre, votre candidature (nom,
              coordonnées, parcours et lettre de motivation) est transmise à
              l&apos;exploitant qui a publié l&apos;offre. Lorsque vous publiez
              un signalement d&apos;incident, son contenu, sa localisation et
              votre nom de déclarant sont visibles par les autres utilisateurs
              sur la carte.
            </p>
            <p>
              Certains prestataires étant établis hors du Sénégal, vos données
              peuvent être transférées à l&apos;étranger. Ces transferts sont
              encadrés par les engagements contractuels de confidentialité et de
              sécurité de chaque prestataire.
            </p>
          </Section>

          <Section id="conservation" title="6. Durées de conservation">
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[520px] text-sm text-left">
                <thead className="bg-gray-50 text-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Données</th>
                    <th className="px-4 py-3 font-semibold">Durée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {RETENTION.map((r) => (
                    <tr key={r.what} className="align-top">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {r.what}
                      </td>
                      <td className="px-4 py-3">{r.how_long}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="securite" title="7. Sécurité">
            <p>
              Les échanges entre votre appareil et nos serveurs sont chiffrés en
              HTTPS. Les mots de passe sont stockés sous forme de condensats
              cryptographiques et ne sont jamais lisibles, y compris par nous.
              L&apos;accès à la base de données est restreint et
              l&apos;authentification de votre compte requiert une vérification
              de votre adresse e-mail.
            </p>
            <p>
              Aucun système n&apos;étant infaillible, si une violation de données
              susceptible d&apos;engendrer un risque pour vos droits survenait,
              nous vous en informerions ainsi que l&apos;autorité compétente.
            </p>
          </Section>

          <Section id="droits" title="8. Vos droits">
            <p>
              Conformément à la loi n° 2008-12 du 25 janvier 2008 sur la
              protection des données à caractère personnel au Sénégal, vous
              disposez des droits suivants :
            </p>
            <ul className="list-disc pl-5 space-y-2">
              {RIGHTS.map((right) => (
                <li key={right}>{right}</li>
              ))}
            </ul>
            <p>
              Pour exercer l&apos;un de ces droits, écrivez à{" "}
              <a
                href={`mailto:${PRIVACY_EMAIL}?subject=Demande%20relative%20a%20mes%20donnees%20personnelles`}
                className="text-green-700 font-medium hover:underline"
              >
                {PRIVACY_EMAIL}
              </a>{" "}
              depuis l&apos;adresse associée à votre compte. Nous répondons dans
              un délai de 30 jours.
            </p>
            <p>
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez
              saisir la Commission de Protection des Données Personnelles (CDP)
              du Sénégal.
            </p>
          </Section>

          <Section id="suppression" title="9. Supprimer votre compte">
            <p>
              Vous pouvez demander la suppression de votre compte et des données
              associées en écrivant à{" "}
              <a
                href={`mailto:${PRIVACY_EMAIL}?subject=Demande%20de%20suppression%20de%20compte`}
                className="text-green-700 font-medium hover:underline"
              >
                {PRIVACY_EMAIL}
              </a>{" "}
              depuis l&apos;adresse e-mail de votre compte, en indiquant «
              suppression de compte » en objet.
            </p>
            <p>
              La demande est traitée manuellement par notre équipe dans un délai
              de 30 jours. Sont effacés : votre profil, vos parcelles, vos
              signalements, vos offres et candidatures, votre progression de
              formation et vos résultats de quiz. Sont conservés les
              justificatifs de commande que la réglementation comptable nous
              impose de garder.
            </p>
            <p>
              Vous pouvez par ailleurs supprimer vous-même, à tout moment et
              directement depuis l&apos;application, vos parcelles, vos
              signalements d&apos;incident et les offres d&apos;emploi que vous
              avez publiées.
            </p>
          </Section>

          <Section id="mineurs" title="10. Mineurs">
            <p>
              Le service n&apos;est pas destiné aux personnes de moins de 16 ans
              et nous ne collectons pas sciemment leurs données. Si vous
              constatez qu&apos;un mineur de moins de 16 ans nous a communiqué
              des données, contactez-nous : elles seront supprimées.
            </p>
          </Section>

          <Section id="modifications" title="11. Modifications">
            <p>
              Cette politique peut évoluer avec le service. La date de dernière
              mise à jour figure en haut de page. En cas de changement important,
              nous vous en informerons par e-mail ou par une notice dans
              l&apos;application avant son entrée en vigueur.
            </p>
          </Section>

          <Section id="contact" title="12. Nous contacter">
            <p>
              AGROPASTORAL GLOBALE FARMS SARL
              <br />
              {storeInfo.addressLines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
              {storeInfo.phone}
              <br />
              <a
                href={`mailto:${PRIVACY_EMAIL}`}
                className="text-green-700 font-medium hover:underline"
              >
                {PRIVACY_EMAIL}
              </a>
            </p>
            <p>
              <Link
                href="/contact"
                className="text-green-700 font-medium hover:underline"
              >
                Formulaire de contact
              </Link>
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
