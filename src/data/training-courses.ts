// Mock data for agricultural training courses

export const trainingCourses: Course[] = [
  {
    id: "course-greenhouse-farming",
    title: "Culture sous Serre et Techniques Modernes",
    description:
      "Apprenez les techniques modernes de culture sous serre pour maximiser votre production agricole. Ce cours couvre la gestion du climat, l'irrigation, et les meilleures pratiques pour cultiver des légumes de qualité.",
    category: "Production",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400",
    difficulty: "intermédiaire",
    duration: 8,
    requiresCertification: true,
    certificationCriteria: {
      minimumScore: 70,
      requiredLessons: 12,
      onSiteTrainingRequired: true,
    },
    tags: ["serre", "production", "légumes", "irrigation"],
    instructorName: "Dr. Amadou Diallo",
    modules: [
      {
        id: "module-greenhouse-intro",
        title: "Introduction aux Serres Agricoles",
        description: "Découvrez les bases de la culture sous serre",
        order: 1,
        lessons: [
          {
            id: "lesson-greenhouse-types",
            title: "Types de Serres et Structures",
            description:
              "Comprendre les différents types de serres disponibles",
            duration: 30,
            order: 1,
            content: [
              {
                type: "video",
                url: "https://example.com/greenhouse-types.mp4",
                thumbnailUrl:
                  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400",
                duration: 900,
              },
              {
                type: "text",
                text: "# Types de Serres\n\nIl existe plusieurs types de serres adaptées au climat sénégalais :\n\n## 1. Serre Tunnel\nLa serre tunnel est la plus courante et la plus économique. Elle convient parfaitement aux climats chauds.\n\n## 2. Serre Chapelle\nPlus grande et plus robuste, idéale pour les exploitations de taille moyenne.\n\n## 3. Serre Multi-Chapelle\nPour les grandes exploitations commerciales.",
              },
              {
                type: "image",
                url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600",
              },
            ],
            quiz: {
              id: "quiz-greenhouse-types",
              title: "Quiz : Types de Serres",
              passingScore: 70,
              questions: [
                {
                  id: "q1",
                  type: "multiple_choice",
                  question: "Quel type de serre est le plus économique ?",
                  options: [
                    "Serre Tunnel",
                    "Serre Chapelle",
                    "Serre Multi-Chapelle",
                    "Serre Verre",
                  ],
                  correctAnswer: 0,
                  explanation:
                    "La serre tunnel est la plus économique et convient bien au climat sénégalais.",
                },
                {
                  id: "q2",
                  type: "true_false",
                  question:
                    "La serre multi-chapelle est adaptée aux petites exploitations.",
                  options: ["Vrai", "Faux"],
                  correctAnswer: 1,
                  explanation:
                    "La serre multi-chapelle est destinée aux grandes exploitations commerciales.",
                },
              ],
            },
          },
          {
            id: "lesson-greenhouse-climate",
            title: "Gestion du Climat sous Serre",
            description:
              "Maîtriser la température, l'humidité et la ventilation",
            duration: 45,
            order: 2,
            content: [
              {
                type: "video",
                url: "https://example.com/climate-control.mp4",
                duration: 1200,
              },
              {
                type: "text",
                text: "# Gestion du Climat\n\nLe contrôle climatique est essentiel pour une production optimale :\n\n- **Température** : 18-28°C selon les cultures\n- **Humidité** : 60-80%\n- **Ventilation** : Ouvrir les côtés pendant les heures chaudes",
              },
            ],
          },
        ],
      },
      {
        id: "module-greenhouse-irrigation",
        title: "Irrigation et Fertigation",
        description: "Techniques d'arrosage et de fertilisation sous serre",
        order: 2,
        lessons: [
          {
            id: "lesson-drip-irrigation",
            title: "Système d'Irrigation Goutte-à-Goutte",
            description: "Installation et gestion du système goutte-à-goutte",
            duration: 40,
            order: 1,
            content: [
              {
                type: "video",
                url: "https://example.com/drip-irrigation.mp4",
                duration: 1500,
              },
              {
                type: "text",
                text: "# Irrigation Goutte-à-Goutte\n\nAvantages :\n- Économie d'eau jusqu'à 70%\n- Distribution uniforme\n- Réduction des maladies foliaires\n- Application directe des engrais",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "course-soil-typology",
    title: "Typologie des Sols et Caractérisation",
    description:
      "Apprenez à identifier les différents types de sols au Sénégal, analyser leurs propriétés et adapter vos pratiques agricoles en conséquence.",
    category: "Agronomie",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400",
    difficulty: "débutant",
    duration: 6,
    requiresCertification: false,
    tags: ["sol", "agronomie", "fertilité"],
    instructorName: "Pr. Fatou Sow",
    modules: [
      {
        id: "module-soil-basics",
        title: "Bases de la Pédologie",
        description: "Comprendre la composition et la structure des sols",
        order: 1,
        lessons: [
          {
            id: "lesson-soil-composition",
            title: "Composition du Sol",
            description: "Éléments minéraux, organiques et texture",
            duration: 35,
            order: 1,
            content: [
              {
                type: "video",
                url: "https://example.com/soil-composition.mp4",
                duration: 800,
              },
              {
                type: "text",
                text: "# Composition du Sol\n\nUn sol agricole contient :\n- **45%** Matière minérale\n- **25%** Air\n- **25%** Eau\n- **5%** Matière organique\n\nLa texture est définie par les proportions de sable, limon et argile.",
              },
            ],
          },
          {
            id: "lesson-soil-senegal",
            title: "Principaux Types de Sols au Sénégal",
            description: "Identifier les sols sénégalais : Dior, Deck, etc.",
            duration: 50,
            order: 2,
            content: [
              {
                type: "text",
                text: "# Types de Sols au Sénégal\n\n## Sol Dior\n- Sol sableux léger\n- Bonne drainage\n- Faible rétention d'eau\n- Cultivable toute l'année\n\n## Sol Deck\n- Sol argileux lourd\n- Bonne fertilité\n- Retient bien l'eau\n- Plus difficile à travailler\n\n## Sol Deck-Dior\n- Sol mixte\n- Équilibre entre drainage et rétention\n- Très bon pour maraîchage",
              },
              {
                type: "image",
                url: "https://images.unsplash.com/photo-1593113598332-21d990dc8de3?w=600",
              },
            ],
            quiz: {
              id: "quiz-soil-types",
              title: "Quiz : Types de Sols",
              passingScore: 70,
              questions: [
                {
                  id: "q1",
                  type: "multiple_choice",
                  question: "Quel sol est le plus adapté au maraîchage ?",
                  options: [
                    "Sol Dior pur",
                    "Sol Deck pur",
                    "Sol Deck-Dior",
                    "Sol rocheux",
                  ],
                  correctAnswer: 2,
                },
                {
                  id: "q2",
                  type: "true_false",
                  question: "Le sol Dior retient très bien l'eau.",
                  options: ["Vrai", "Faux"],
                  correctAnswer: 1,
                  explanation:
                    "Le sol Dior est sableux et ne retient pas bien l'eau.",
                },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: "course-pest-disease",
    title: "Gestion des Maladies et Ravageurs",
    description:
      "Identifiez et traitez les principales maladies et ravageurs affectant les cultures maraîchères au Sénégal. Approches préventives et curatives.",
    category: "Protection des Cultures",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=400",
    difficulty: "intermédiaire",
    duration: 10,
    requiresCertification: true,
    certificationCriteria: {
      minimumScore: 75,
      requiredLessons: 15,
    },
    tags: ["maladies", "ravageurs", "protection", "bio"],
    instructorName: "Dr. Cheikh Ndiaye",
    modules: [
      {
        id: "module-pest-identification",
        title: "Identification des Ravageurs",
        description: "Reconnaître les principaux ravageurs des cultures",
        order: 1,
        lessons: [
          {
            id: "lesson-insect-pests",
            title: "Ravageurs Insectes Communs",
            description: "Pucerons, aleurodes, chenilles et autres",
            duration: 45,
            order: 1,
            content: [
              {
                type: "video",
                url: "https://example.com/insect-pests.mp4",
                duration: 1800,
              },
              {
                type: "text",
                text: "# Principaux Ravageurs\n\n## Pucerons\n- Petits insectes verts ou noirs\n- Sucent la sève des plantes\n- Transmission de virus\n\n## Aleurodes (Mouches blanches)\n- Petites mouches blanches sous les feuilles\n- Affaiblissent les plants\n- Sécrètent du miellat\n\n## Chenilles\n- Dévorent les feuilles et fruits\n- Plusieurs espèces (noctuelle, pyrale)",
              },
              {
                type: "image",
                url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600",
              },
            ],
          },
          {
            id: "lesson-disease-identification",
            title: "Identification des Maladies",
            description: "Reconnaître les symptômes des maladies courantes",
            duration: 50,
            order: 2,
            content: [
              {
                type: "text",
                text: "# Maladies Courantes\n\n## Mildiou\n- Taches jaunes sur feuilles\n- Duvet blanc en dessous\n- Favorisé par l'humidité\n\n## Oïdium\n- Poudre blanche sur les feuilles\n- Temps sec et chaud\n\n## Fusariose\n- Flétrissement de la plante\n- Jaunissement des feuilles\n- Maladie du sol",
              },
            ],
            quiz: {
              id: "quiz-disease-id",
              title: "Quiz : Identification des Maladies",
              passingScore: 75,
              questions: [
                {
                  id: "q1",
                  type: "multiple_choice",
                  question: "Quelle maladie est favorisée par l'humidité ?",
                  options: ["Oïdium", "Mildiou", "Fusariose", "Virose"],
                  correctAnswer: 1,
                },
              ],
            },
          },
        ],
      },
      {
        id: "module-pest-control",
        title: "Méthodes de Lutte",
        description: "Stratégies de prévention et traitement",
        order: 2,
        lessons: [
          {
            id: "lesson-biological-control",
            title: "Lutte Biologique",
            description:
              "Utilisation d'organismes auxiliaires et produits naturels",
            duration: 55,
            order: 1,
            content: [
              {
                type: "video",
                url: "https://example.com/biological-control.mp4",
                duration: 2000,
              },
              {
                type: "text",
                text: "# Lutte Biologique\n\n## Auxiliaires\n- Coccinelles contre pucerons\n- Trichogrammes contre chenilles\n- Chrysopes\n\n## Produits Naturels\n- Neem (margousier)\n- Savon noir\n- Purins de plantes\n- Bacillus thuringiensis",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "course-irrigation-fertigation",
    title: "Irrigation et Fertigation Modernes",
    description:
      "Maîtrisez les techniques d'irrigation efficaces et apprenez à combiner arrosage et fertilisation pour optimiser vos rendements.",
    category: "Gestion de l'Eau",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    difficulty: "intermédiaire",
    duration: 7,
    requiresCertification: true,
    certificationCriteria: {
      minimumScore: 70,
      requiredLessons: 10,
    },
    tags: ["irrigation", "eau", "fertilisation", "rendement"],
    instructorName: "Ing. Moussa Sarr",
    modules: [
      {
        id: "module-irrigation-systems",
        title: "Systèmes d'Irrigation",
        description: "Comparaison et installation des systèmes d'irrigation",
        order: 1,
        lessons: [
          {
            id: "lesson-drip-vs-sprinkler",
            title: "Goutte-à-Goutte vs Aspersion",
            description: "Avantages et inconvénients de chaque système",
            duration: 40,
            order: 1,
            content: [
              {
                type: "video",
                url: "https://example.com/irrigation-comparison.mp4",
                duration: 1400,
              },
              {
                type: "text",
                text: "# Comparaison des Systèmes\n\n## Goutte-à-Goutte\n**Avantages:**\n- Économie d'eau 50-70%\n- Précision d'application\n- Fertigation facile\n- Réduit maladies foliaires\n\n**Inconvénients:**\n- Coût initial élevé\n- Risque de colmatage\n- Maintenance requise\n\n## Aspersion\n**Avantages:**\n- Installation simple\n- Coût modéré\n- Couvre grande surface\n\n**Inconvénients:**\n- Consommation d'eau élevée\n- Favorise maladies\n- Moins précis",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "course-composting",
    title: "Techniques de Compostage",
    description:
      "Apprenez à produire votre propre compost de qualité pour améliorer la fertilité de vos sols et réduire les coûts d'intrants.",
    category: "Fertilité",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
    difficulty: "débutant",
    duration: 4,
    requiresCertification: false,
    tags: ["compost", "fertilité", "biologique", "économie"],
    instructorName: "Mme. Aïssatou Diop",
    modules: [
      {
        id: "module-composting-basics",
        title: "Bases du Compostage",
        description: "Comprendre le processus de compostage",
        order: 1,
        lessons: [
          {
            id: "lesson-what-is-compost",
            title: "Qu'est-ce que le Compost ?",
            description: "Définition et bénéfices du compost",
            duration: 25,
            order: 1,
            content: [
              {
                type: "text",
                text: "# Le Compost\n\nLe compost est le résultat de la décomposition de matières organiques par des micro-organismes.\n\n## Bénéfices\n- Améliore la structure du sol\n- Apporte des nutriments\n- Retient l'eau\n- Stimule la vie biologique\n- Réduit les déchets\n- Économise sur les engrais",
              },
              {
                type: "video",
                url: "https://example.com/compost-intro.mp4",
                duration: 600,
              },
            ],
          },
          {
            id: "lesson-compost-ingredients",
            title: "Ingrédients du Compost",
            description: "Matières vertes et matières brunes",
            duration: 30,
            order: 2,
            content: [
              {
                type: "text",
                text: "# Ingrédients du Compost\n\n## Matières Vertes (Azote)\n- Déchets de cuisine (épluchures)\n- Herbe fraîche\n- Fumier frais\n- Feuilles vertes\n\n## Matières Brunes (Carbone)\n- Paille et foin sec\n- Feuilles mortes\n- Copeaux de bois\n- Carton\n\n**Ratio idéal: 2 parties brunes pour 1 partie verte**",
              },
            ],
            quiz: {
              id: "quiz-compost-basics",
              title: "Quiz : Bases du Compost",
              passingScore: 70,
              questions: [
                {
                  id: "q1",
                  type: "multiple_choice",
                  question: "Quel est le ratio idéal matières brunes/vertes ?",
                  options: ["1:1", "2:1", "3:1", "1:2"],
                  correctAnswer: 1,
                },
                {
                  id: "q2",
                  type: "true_false",
                  question: "Le fumier frais est une matière brune.",
                  options: ["Vrai", "Faux"],
                  correctAnswer: 1,
                  explanation:
                    "Le fumier frais est riche en azote, c'est une matière verte.",
                },
              ],
            },
          },
          {
            id: "lesson-compost-methods",
            title: "Méthodes de Compostage",
            description: "Tas, bac, fosse - quelle méthode choisir ?",
            duration: 35,
            order: 3,
            content: [
              {
                type: "video",
                url: "https://example.com/compost-methods.mp4",
                duration: 1200,
              },
              {
                type: "text",
                text: "# Méthodes de Compostage\n\n## Compost en Tas\n- Simple et économique\n- Retourner tous les 15 jours\n- Prêt en 3-6 mois\n\n## Compost en Bac\n- Plus esthétique\n- Protection des animaux\n- Garde la chaleur\n\n## Compost en Fosse\n- Adapté aux zones sèches\n- Garde l'humidité\n- Moins de retournements",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "course-technical-itinerary",
    title: "Itinéraires Techniques : Du Semis à la Récolte",
    description:
      "Maîtrisez les itinéraires techniques complets pour les principales cultures maraîchères : tomate, oignon, chou, piment, aubergine.",
    category: "Production",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=400",
    difficulty: "avancé",
    duration: 12,
    requiresCertification: true,
    certificationCriteria: {
      minimumScore: 80,
      requiredLessons: 20,
      onSiteTrainingRequired: true,
    },
    tags: ["tomate", "oignon", "culture", "technique"],
    instructorName: "Ing. Mamadou Lamine Ba",
    modules: [
      {
        id: "module-tomato-itinerary",
        title: "Itinéraire Technique de la Tomate",
        description: "Production de tomate du semis à la récolte",
        order: 1,
        lessons: [
          {
            id: "lesson-tomato-nursery",
            title: "Pépinière de Tomate",
            description: "Préparation des plants en pépinière",
            duration: 45,
            order: 1,
            content: [
              {
                type: "video",
                url: "https://example.com/tomato-nursery.mp4",
                duration: 1500,
              },
              {
                type: "text",
                text: "# Pépinière de Tomate\n\n## Préparation du Substrat\n- 1/3 terreau\n- 1/3 sable\n- 1/3 compost bien décomposé\n\n## Semis\n- Profondeur: 0.5-1 cm\n- Espacement: 2-3 cm\n- Arrosage léger quotidien\n\n## Durée\n- 25-30 jours en pépinière\n- Prêt quand 4-5 vraies feuilles",
              },
            ],
          },
          {
            id: "lesson-tomato-transplanting",
            title: "Repiquage et Plantation",
            description: "Techniques de repiquage et densité de plantation",
            duration: 40,
            order: 2,
            content: [
              {
                type: "text",
                text: "# Repiquage de la Tomate\n\n## Préparation du Sol\n- Labour profond (30 cm)\n- Apport de compost: 20-30 t/ha\n- Formation de billons\n\n## Plantation\n- Espacement: 50 cm x 80 cm\n- Densité: 25,000 plants/ha\n- Heure: Fin d'après-midi\n- Arrosage immédiat",
              },
            ],
          },
        ],
      },
    ],
  },
];

export default trainingCourses;
