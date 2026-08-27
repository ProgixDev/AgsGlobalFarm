# AGS Globalfarm — Description détaillée de l'application

**Version applicative :** mobile `0.2.0` — web `0.1.0`
**Éditeur :** AGS Global Farm SARL
**Contact :** contact@agsglobalfarm.com — +221 78 138 38 38 — Cité nouvel horizon, villa 642, Keur Ndiaye LO, Dakar
**Site public :** https://www.agsglobalfarm.com
**Identifiant applicatif :** `com.progix.agsglobalfarmsarl` (Android & iOS)

---

## 1. Présentation générale

AGS Globalfarm est une **plateforme numérique agricole dédiée au Sénégal**, composée de deux produits complémentaires qui partagent la même base de données et le même système de comptes :

| Produit | Rôle | Technologie |
|---|---|---|
| **Application mobile** (Android / iOS) | Outil de terrain pour les producteurs et les demandeurs d'emploi agricole | React Native + Expo |
| **Plateforme web** | Vitrine publique, boutique, formations, paiement et **backend/API** de l'ensemble | Next.js (App Router) |

L'objectif est de **regrouper dans un seul outil** ce qui est aujourd'hui dispersé : la cartographie des exploitations, le conseil technique (fertilisation et traitements), l'approvisionnement en intrants, la formation professionnelle, l'emploi agricole et la remontée d'alertes sanitaires ou climatiques.

L'application est **intégralement en français** et calibrée sur le contexte sénégalais : 14 régions administratives cartographiées, données pédoclimatiques locales, paiement mobile money via PayDunya, cultures maraîchères de référence.

---

## 2. Profils utilisateurs

L'application distingue **trois rôles**, définis à l'inscription et pilotant l'ensemble de la navigation :

### 2.1 Exploitant / Propriétaire de ferme (`farm_owner`)

Accès complet à la plateforme :

- déclaration et cartographie de son exploitation ;
- génération d'itinéraires techniques personnalisés ;
- signalement d'incidents ;
- **publication d'offres d'emploi** et gestion des candidatures reçues ;
- boutique d'intrants et commandes ;
- catalogue de formations.

### 2.2 Demandeur d'emploi agricole (`job_seeker`)

Navigation allégée et dédiée :

- consultation de la carte agricole (sans le mode « Ma Ferme ») ;
- **recherche et candidature** aux offres d'emploi ;
- suivi de ses candidatures ;
- accès à la boutique, aux formations et aux signalements.

### 2.3 Administrateur (`admin`)

Rôle back-office pour la gestion du catalogue produits, des formations et du contenu de la plateforme.

> La bascule de rôle est gérée côté serveur (`role: farm_owner | job_seeker | admin`) et se traduit par **deux arborescences de navigation distinctes** dans l'application mobile.

---

## 3. Parcours d'entrée dans l'application

1. **Écran d'accueil animé (onboarding)** — 5 écrans de présentation : bienvenue, carte interactive, conseils personnalisés, emploi agricole, formation agricole. Affiché une seule fois, puis mémorisé sur l'appareil.
2. **Création de compte** — prénom, nom, e-mail, téléphone, genre (optionnel), mot de passe, **choix du profil** (exploitant ou demandeur d'emploi).
3. **Vérification de l'e-mail par code OTP à 6 chiffres** (validité 10 minutes) envoyé automatiquement par e-mail. La vérification est **obligatoire** avant l'accès.
4. **Connexion** — e-mail + mot de passe, session valable **30 jours**, jeton stocké dans le coffre-fort sécurisé du téléphone (Secure Store / Face ID).
5. **Mot de passe oublié** — réinitialisation par lien e-mail ou par code OTP.

---

## 4. Fonctionnalités détaillées

### 4.1 Carte agricole interactive

Cartographie vectorielle Mapbox centrée sur le Sénégal, avec bornage du territoire national. L'écran propose **trois modes** commutables.

#### a) Mode « Explorer »

- Affichage des **14 régions du Sénégal** en polygones colorés et cliquables (Dakar, Diourbel, Fatick, Kaffrine, Kaolack, Kédougou, Kolda, Louga, Matam, Saint-Louis, Sédhiou, Tambacounda, Thiès, Ziguinchor).
- Sélection d'une région → fiche agro-pédologique détaillée :
  - **climat** (ex. sahélien côtier, soudano-sahélien) ;
  - **pluviométrie annuelle** (ex. 400–600 mm/an) ;
  - **principales cultures** de la région ;
  - **principaux élevages** ;
  - **sols** : types dominants, description, **pH**, drainage ;
  - **notes agronomiques** (pression foncière, dépendance à l'irrigation, etc.).
- Navigation descendante **région → département → commune**, avec base de référence des départements, types de sols, types de production et cultures classées par catégorie.
- Recherche textuelle et recentrage automatique sur les limites de la région choisie.

#### b) Mode « Ma Ferme » (exploitants uniquement)

- **Localisation GPS** de l'exploitation via le capteur du téléphone, ou pointage manuel sur la carte.
- Deux géométries possibles :
  - **point** (localisation simple) ;
  - **polygone** (tracé du périmètre parcellaire, avec calcul automatique du centre).
- Fiche exploitation : nom, **surface en hectares**, tranche de surface (moins d'1 ha, 1 ha, 2 ha, autre), **type d'exploitation** (maraîcher, avicole, fruitier, élevage, agroécologie, céréaliculture, aquaculture, autre), cultures en cours, contact.
- Option **« masquer mes informations personnelles »** pour ne pas exposer ses coordonnées aux autres utilisateurs.
- Les fermes enregistrées sont réutilisées automatiquement lors de la publication d'une offre d'emploi.

#### c) Mode « Incidents »

- Visualisation géolocalisée des incidents déclarés par la communauté, avec marqueurs colorés par catégorie et par gravité.
- Panneau de gestion des signalements directement depuis la carte.

---

### 4.2 Signalement d'incidents agricoles

Système d'alerte collaboratif permettant de remonter un problème sur le terrain.

**8 catégories :**

| Catégorie | Description |
|---|---|
| Maladie des cultures | Maladies fongiques, bactériennes ou virales |
| Parasites & ravageurs | Insectes nuisibles, rongeurs, autres ravageurs |
| Incendie | Feux de brousse, incendies en zone agricole |
| Inondation | Montée des eaux dans les zones cultivées |
| Sécheresse | Déficit hydrique |
| Invasion acridienne | Criquets |
| Tempête / vent violent | Dégâts climatiques |
| Autre | Catégorie libre personnalisable |

- **3 niveaux de gravité** : faible, moyen, élevé.
- Champs : titre, description, **coordonnées GPS**, région, **photos** (plusieurs images hébergées sur Cloudinary).
- **Statut** : actif / résolu — l'auteur peut clôturer son signalement.
- Historique personnel « **Mes signalements** » accessible depuis le profil.
- Le nom du déclarant est associé au signalement pour la traçabilité.

---

### 4.3 Générateur d'itinéraire technique (fonction phare)

Outil de **conseil agronomique automatisé** qui produit un plan de fertilisation et de protection phytosanitaire **calculé à la surface exacte** de l'utilisateur.

**Fonctionnement :**

1. L'utilisateur choisit une culture parmi le référentiel : **tomate, aubergine, piment, poivron, concombre**.
2. Il saisit la **surface en m²**.
3. L'application **recalcule au prorata** toutes les doses du programme de référence.
4. Un **PDF professionnel est généré sur l'appareil**, avec logo, en-tête, tableaux de doses et mentions techniques.

**Contenu de l'itinéraire :**

- **Programme de fertilisation** phasé — soit par semaines (ex. tomate : S1-S2, S3-S4, S5-S6, S7-S9, S10-S12), soit par stade phénologique (ex. aubergine : installation, croissance, floraison). Chaque phase liste les produits et leur dose exacte (MAP, nitrate de calcium, nitrate de potassium, sulfate de magnésium, etc.).
- **Protocole phytosanitaire** organisé par familles : insecticides, nématicides, fongicides, acaricides, compléments, acides aminés — avec noms commerciaux des produits.
- **Fréquences d'application** : programme préventif hebdomadaire, protocole renforcé en cas d'attaque.
- **Avertissement réglementaire** rappelant de lire la notice d'emballage et de respecter les doses homologuées.
- Notes de culture et spécificités par espèce.

**Gestion des documents :**

- **Historique** de tous les itinéraires générés (culture, surface, date).
- Ouverture du PDF dans le lecteur du téléphone.
- **Partage** (WhatsApp, e-mail, etc.).
- **Enregistrement dans le dossier Téléchargements** de l'appareil.
- **Régénération** d'un PDF supprimé.

---

### 4.4 Emploi agricole

Place de marché de l'emploi reliant exploitations et main-d'œuvre.

**Côté exploitant (`farm_owner`) :**

- **Publication d'une offre** : intitulé du poste, nom de la ferme (repris automatiquement des fermes enregistrées), **région et département** (listes officielles), **type de contrat** (CDI, CDD, Saisonnier, Stage), **fourchette salariale**, description détaillée, liste de **prérequis / compétences**.
- **Statut de l'offre** : active, en pause, clôturée, expirée.
- **Tableau des candidatures reçues** par offre, avec compteur de candidats.
- Traitement des candidatures (acceptation / refus).

**Côté demandeur d'emploi (`job_seeker`) :**

- **Recherche plein texte** sur les intitulés, fermes, descriptions et localisations.
- **Filtres** par région, département et type de contrat.
- Fiche offre complète et **candidature en un clic**.
- Espace « **Mes candidatures** » avec suivi du statut de chaque dossier.

---

### 4.5 Boutique d'intrants agricoles

Catalogue e-commerce d'intrants, avec paiement en ligne.

- **4 catégories** : engrais, produits phytosanitaires, semences, petit matériel.
- **Fiche produit détaillée** : visuel, prix TTC, unité de vente, description courte et longue, **marque**, **origine**, **mode d'usage**, **dosage recommandé**, **consignes de sécurité**, **disponibilité et quantité en stock**.
- Recherche plein texte et filtrage par catégorie.
- **Panier** persistant avec gestion des quantités.
- **Paiement sécurisé via PayDunya** (mobile money et cartes) : depuis le mobile, un **jeton à usage unique** (valable 5 secondes) authentifie l'utilisateur et le redirige vers le tunnel de paiement web, sans ressaisie d'identifiants.
- **Confirmation automatique** du paiement par callback serveur, avec mise à jour du statut de commande (payée, en attente, échouée), reçu PayDunya et motif d'échec le cas échéant.
- Espace « **Mes commandes** » : historique, détail des lignes, montant total, statut et moyen de paiement.

---

### 4.6 Formation professionnelle agricole

Deux formats de formation coexistent dans le même catalogue.

#### a) Formations en ligne

- Fiche formation : titre, description, visuel, **niveau**, **durée**, catégorie, prix.
- Contenu structuré en **sections → leçons**.
- **Suivi de progression** synchronisé avec le serveur (leçons terminées, pourcentage d'avancement).
- **Quiz d'évaluation** organisé par sections, avec questions notées en points, options de réponse et illustrations possibles.
- **Historique des tentatives** et **résultat noté**.
- **Certificat PDF généré automatiquement** en cas de réussite, sur modèle graphique officiel, avec nom du bénéficiaire et date d'obtention — **envoyé par e-mail**, avec possibilité de renvoi.

#### b) Formations présentielles

- Fiche formation : titre, description, **durée en jours**, niveau, prix, **adresse**.
- **Programme journalier détaillé** : pour chaque journée, créneaux horaires (de/à), intitulé et description de chaque séquence.
- **Sessions planifiées** : dates de début et de fin, lieu, **nombre de places disponibles**, statut (ouverte, en cours, terminée), liste des participants.
- Inscription à une session depuis l'application, avec paiement.

#### c) Tableau de bord de formation

Vue consolidée des formations achetées (« Mes formations »), avec avancement et accès direct à la reprise du parcours.

---

### 4.7 Compte et paramètres

- **Profil utilisateur** avec avatar (import depuis la galerie, hébergement Cloudinary).
- **Informations personnelles** modifiables : prénom, nom, e-mail, téléphone, genre.
- **Changement de mot de passe** depuis l'application.
- **Préférences de notifications** paramétrables par type d'événement.
- **Raccourcis contextuels** selon le rôle :
  - exploitant : Mes offres, Candidatures reçues, Mes commandes, Mes signalements, Notifications ;
  - demandeur d'emploi : Mes candidatures, Mes formations, Mes commandes, Mes signalements, Notifications.
- **Aide** et **Conditions d'utilisation** intégrées.
- **Suppression de compte** et **suppression des données** : pages dédiées conformes aux exigences des stores (Google Play / App Store).

---

## 5. Plateforme web

### 5.1 Pages publiques

- **Accueil** — sections Hero, À propos, Activités, Formations, Événements.
- **À propos** de l'entreprise.
- **Boutique** en ligne.
- **Formations** (catalogue public).
- **Contact** (avec bouton WhatsApp direct).
- **Politique de confidentialité**.
- **Suppression de compte** et **Suppression de données** (pages de conformité).

### 5.2 Espace privé

- **Tunnel de paiement** (checkout) avec pages de succès et d'annulation.
- **Redirection mobile** dédiée : `/checkout/mobile-redirect` — permet à l'application mobile de déléguer le paiement au web tout en conservant la session.
- **Mes formations** : lecture des leçons, quiz, résultats.
- **Mes commandes**.

### 5.3 Rôle de backend

La plateforme web héberge **l'intégralité de l'API** consommée par l'application mobile :

| Domaine | Points d'entrée |
|---|---|
| Authentification | `/api/auth/*`, réinitialisation de mot de passe |
| Fermes | `/api/farms`, `/api/farms/[id]` |
| Incidents | `/api/incidents`, `/api/incidents/mine`, `/api/incidents/[id]` |
| Emploi | `/api/jobs`, `/api/jobs/mine`, `/api/jobs/[id]/apply`, `/api/jobs/[id]/applications`, `/api/jobs/[id]/status` |
| Candidatures | `/api/applications`, `/api/applications/mine`, `/api/applications/[id]` |
| Produits | `/api/products`, `/api/products/categories`, `/api/products/[id]` |
| Commandes | `/api/orders`, `/api/orders/[id]` |
| Paiement | `/api/payment/initiate`, `/api/payment/callback` |
| Formations | `/api/formations/online`, `/api/formations/presential`, `/api/formations/owned`, `/api/formations/enroll` |
| Pédagogie | `/api/formations/[id]/progress`, `/quiz`, `/quiz/submit`, `/quiz/result`, `/quiz/attempts` |
| Certificats | `/api/formations/[id]/certificate`, `/certificate/resend` |
| Médias | `/api/upload/signature` (upload signé Cloudinary) |

---

## 6. Architecture technique

### 6.1 Organisation

Monorepo à deux espaces de travail indépendants :

```
AgsGlobalFarmSarl/
├── mobile/   → application Expo / React Native (gestionnaire : bun)
└── web/      → application Next.js + API (gestionnaire : npm)
```

### 6.2 Application mobile

- **React Native 0.83** / **React 19** / **Expo SDK 55**
- **Expo Router** (navigation par fichiers, routes typées) + React Compiler
- **NativeWind / Tailwind CSS** pour le style, thème clair/sombre automatique
- **Zustand** pour l'état global (utilisateur, carte, boutique, commandes, emplois, formations, itinéraires)
- **Zod** pour la validation des formulaires
- **Mapbox** (`@rnmapbox/maps`) pour la cartographie vectorielle
- **expo-location** (GPS), **expo-image-picker** (photos), **expo-print** (génération PDF), **expo-sharing** (partage), **expo-secure-store** (stockage chiffré des sessions), **expo-haptics** (retours tactiles)
- Polices Google **DM Sans** et **Figtree**

### 6.3 Plateforme web

- **Next.js 16** (App Router) / **React 19**
- **MongoDB + Mongoose** comme base de données
- **Better Auth** pour l'authentification (partagée mobile/web via le plugin Expo)
- **Cloudinary** pour l'hébergement et l'optimisation des médias
- **PayDunya** pour les paiements
- **Nodemailer + React Email** pour les e-mails transactionnels
- **pdf-lib** pour la génération des certificats
- **Tailwind CSS 4**, **Radix UI**, **Framer Motion** pour l'interface

### 6.4 Modèle de données (collections MongoDB)

`User`, `Account`, `Session`, `Verification`, `Farm`, `Incident`, `Job`, `JobApplication`, `Product`, `Order`, `OnlineFormation`, `PresentialFormation`, `FormationProgress`, `QuizResult`.

---

## 7. Sécurité et conformité

- **Authentification centralisée** (Better Auth) partagée entre le web et le mobile ; sessions de 30 jours avec renouvellement quotidien.
- **Vérification obligatoire de l'e-mail** par code OTP à 6 chiffres (expiration 10 min).
- **Jetons à usage unique** (5 s) pour le passage sécurisé du mobile au tunnel de paiement web.
- **Stockage chiffré** de la session sur l'appareil, protégeable par **Face ID / biométrie**.
- **Uploads signés** côté serveur : aucun secret Cloudinary n'est exposé dans l'application.
- **Permissions explicites** demandées à l'utilisateur avec justification en français :
  - localisation GPS (« AGS utilise votre position GPS pour localiser votre ferme avec précision ») ;
  - accès aux photos (avatar et photos d'incident) ;
  - *aucun accès caméra ni microphone n'est requis.*
- **Confidentialité** : option de masquage des informations personnelles sur la carte publique.
- **Conformité stores** : politique de confidentialité, page de suppression de compte et page de suppression de données publiées et référencées dans le sitemap.

---

## 8. Disponibilité

| Élément | Statut |
|---|---|
| Plateformes | Android et iOS (support tablette iOS activé) |
| Orientation | Portrait |
| Thème | Clair / sombre automatique |
| Langue | Français |
| Distribution | Build de production Android signé (APK / AAB), projet EAS configuré |
| Zone couverte | Sénégal — 14 régions |

---

## 9. Synthèse des apports pour l'utilisateur

| Besoin agricole | Réponse de l'application |
|---|---|
| Savoir quoi cultiver et comment | Fiches agro-pédologiques par région + itinéraires techniques |
| Doser correctement engrais et traitements | Générateur de doses calculées à la surface réelle, avec PDF |
| Trouver des intrants de qualité | Boutique avec fiches techniques, dosages et consignes de sécurité |
| Payer sans se déplacer | Paiement mobile money / carte via PayDunya |
| Recruter ou trouver un emploi | Place de marché de l'emploi agricole filtrée par région |
| Se former et le prouver | Formations en ligne et présentielles + certificat PDF officiel |
| Alerter et être alerté | Réseau de signalement d'incidents géolocalisés |
| Valoriser son exploitation | Fiche de ferme cartographiée (point ou périmètre) |
