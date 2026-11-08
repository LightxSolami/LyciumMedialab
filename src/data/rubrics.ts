export type Rubric = {
  name: string;
  slug: string;
  title: string;
  deck: string;
  description: string;
  status: string;
  symbol: string;
  presentation: {
    intro: string;
    focusTitle: string;
    focus: string;
    questions: string[];
    gameTarget: string;
    gameLabel: string;
  };
};

export const rubrics: Rubric[] = [
        {
          name: "Les Passages",
          slug: "les-passages",
          title: "Aux frontières du savoir",
          deck: "Ce que nos certitudes ne savent pas d’elles-mêmes.",
          description: "Les traces du réel, les limites des instruments et les questions que nos certitudes ne savent pas poser.",
          status: "Présentation en ligne · texte intégral à intégrer.",
          symbol: "✧",
          presentation: {
            intro: "Aux frontières du savoir explore ce qui se passe quand une observation résiste à l’explication attendue. Une trace, un outil et une carte ne livrent jamais seuls tout le sens : il faut interroger leur contexte et les choix qui les ont produits.",
            focusTitle: "Observer avant de conclure",
            focus: "Cette entrée du numéro invite à passer d’un indice à plusieurs interprétations possibles, puis à revenir au texte pour distinguer ce qui est constaté de ce qui reste hypothèse.",
            questions: ["Qu’est-ce qu’un instrument rend visible — et qu’est-ce qu’il laisse de côté ?", "À quel moment un indice devient-il une explication ?", "Où passe la frontière entre une donnée et son interprétation ?"],
            gameTarget: "j01-game",
            gameLabel: "J01 · Les mots des frontières"
          }
        },
        {
          name: "Les légendes de la science",
          slug: "les-legendes",
          title: "Ératosthène — Mesurer ce qu’on ne peut parcourir",
          deck: "L’ombre, la mesure et la mémoire.",
          description: "Une mesure du monde, des sources antiques et les générations qui ont transmis son récit.",
          status: "Présentation en ligne · sources historiques à vérifier avant publication.",
          symbol: "⌖",
          presentation: {
            intro: "Le récit d’Ératosthène met en scène une idée puissante : comparer des ombres et une distance pour estimer une circonférence que personne n’a besoin de parcourir en entier. La démonstration géométrique est simple à manipuler ; les conditions historiques le sont moins.",
            focusTitle: "Un calcul, plusieurs hypothèses",
            focus: "Le prototype expose la relation entre angle, distance et tour complet, et sépare explicitement le résultat du modèle des valeurs rapportées par les traditions historiques. Aucune réplique inventée n’est attribuée au savant.",
            questions: ["Qu’est-ce que la géométrie permet de déduire d’une mesure locale ?", "Quelles conditions rendent la comparaison des deux villes possible ?", "Comment distinguer un calcul simplifié d’un témoignage historique ?"],
            gameTarget: "j02-game",
            gameLabel: "J02 · Le Cinquantième"
          }
        },
        {
          name: "La vie des flux",
          slug: "la-vie-des-flux",
          title: "La carte et le territoire",
          deck: "Ce que nos représentations font apparaître, et ce qui leur échappe.",
          description: "Cartes, mesures, frontières et décisions : un territoire ne cesse pas de changer lorsqu’on le dessine.",
          status: "Présentation en ligne · paramètres du modèle à tester.",
          symbol: "⌁",
          presentation: {
            intro: "Une carte n’est pas le territoire : c’est un choix de représentation. Dans cette rubrique, une vallée change avec les saisons, tandis que relief, eau, chemins et usages du sol font apparaître différentes histoires du même lieu.",
            focusTitle: "Construire et observer les flux",
            focus: "La simulation propose un petit terrain déterministe où canaux, parcelles et passages ont des règles visibles. Ses chiffres sont des paramètres ludiques, pas une prévision hydrologique, une économie réaliste ou une mesure écologique.",
            questions: ["Quelles relations la carte montre-t-elle quand une couche est activée ?", "Qui accède au marché quand un passage est construit ou interrompu ?", "Quelles dimensions du territoire échappent à ce modèle volontairement réduit ?"],
            gameTarget: "j03-game",
            gameLabel: "J03 · L’Atlas vivant"
          }
        },
        {
          name: "Formes et imaginaires",
          slug: "formes-et-imaginaires",
          title: "Quand le son dessine des formes",
          deck: "De la vibration à la matière, de la sensation au sens.",
          description: "Un son, des formes, des harmonies et des mots : comment nos expériences prennent-elles sens ?",
          status: "Présentation en ligne · médias originaux à produire.",
          symbol: "◌",
          presentation: {
            intro: "Quand le son dessine des formes, une vibration physique, une image calculée et une sensation personnelle peuvent se répondre sans se confondre. Cette rubrique traverse la matière, l’écoute et les associations imaginaires en laissant plusieurs perceptions coexister.",
            focusTitle: "Trois stations, trois façons de voir",
            focus: "La plaque distingue un tracé abstrait de signal d’une figure nodale réelle ; la station perceptive ne corrige pas les associations ; la scène compare deux sons originaux sur la même image. Le son reste facultatif.",
            questions: ["Que montre réellement une visualisation sonore ?", "Pourquoi une même forme peut-elle évoquer des choses différentes ?", "Comment un accompagnement transforme-t-il une scène sans changer l’image ?"],
            gameTarget: "j04-game",
            gameLabel: "J04 · Le laboratoire des correspondances"
          }
        },
        {
          name: "Du savoir au faire",
          slug: "du-savoir-au-faire",
          title: "Quand le vivant entre dans la boucle",
          deck: "De l’invention à l’ouvrage, ce que les systèmes demandent pour exister.",
          description: "Eau, capteurs, réseau, code, terrain, maintenance et décisions collectives : ce qu’il faut réellement pour qu’un système fonctionne.",
          status: "Présentation en ligne · recette des contrôles à compléter.",
          symbol: "⌘",
          presentation: {
            intro: "Quand le vivant entre dans la boucle, les objets seuls ne suffisent pas : une pompe a besoin d’énergie, d’une conduite et d’une destination ; une mesure doit pouvoir circuler et être comprise. La mission transforme ces dépendances en obstacles concrets à réparer.",
            focusTitle: "Relier les systèmes, pas collectionner des machines",
            focus: "Dans cette aventure originale, trouvez trois pièces puis testez les relations hydrauliques, énergétiques et informationnelles. Deux configurations peuvent réussir ; une pièce isolée ne valide jamais le système.",
            questions: ["Quelle panne apparaît quand un raccord manque ?", "Existe-t-il plusieurs chemins fonctionnels pour atteindre le même objectif ?", "Que faut-il vérifier avant de dire qu’une mesure est exploitable ?"],
            gameTarget: "j05-game",
            gameLabel: "J05 · Le Chantier vivant"
          }
        },
        {
          name: "Le Contrechamp",
          slug: "le-contrechamp",
          title: "À quoi reconnaît-on un chercheur ?",
          deck: "Les anciennes institutions du savoir et leurs nouveaux oracles.",
          description: "Titres, laboratoires, plateformes et métiers : une satire des dispositifs qui consacrent le savoir.",
          status: "Présentation en ligne · dossiers fictifs à relire.",
          symbol: "◈",
          presentation: {
            intro: "À quoi reconnaît-on un chercheur ? Cette rubrique regarde les mécanismes qui donnent de la crédibilité à une affirmation et les métiers collectifs qui rendent une recherche possible. Elle préfère l’examen des preuves au prestige comme au cynisme.",
            focusTitle: "Évaluer une revendication avec nuance",
            focus: "Quatre dossiers entièrement fictifs permettent de consulter une méthode, d’examiner les limites, puis de reconnaître les contributions. Les conclusions proposées varient selon les pièces : ni toute autorité n’est vérité, ni tout résultat n’est suspect par principe.",
            questions: ["Quelles traces soutiennent réellement l’affirmation ?", "Quelles incertitudes empêchent de généraliser ?", "Comment créditer le travail collectif sans fabriquer un héros unique ?"],
            gameTarget: "j06-game",
            gameLabel: "J06 · Le Temple des oracles"
          }
        },
        {
          name: "Laboratoire ludique",
          slug: "laboratoire-ludique",
          title: "L’arcade des idées",
          deck: "Explorer en jouant, expérimenter en manipulant.",
          description: "Enquêtes, énigmes, simulations et expériences interactives prolongent chaque rubrique.",
          status: "J01–J06 prototypes jouables · recette utilisateur à venir.",
          symbol: "✳",
          presentation: {
            intro: "Le Laboratoire ludique prolonge chaque texte par une expérience plutôt que par un contrôle de connaissances. Une grille, une mesure, une vallée, une écoute, un chantier ou une enquête rendent une idée manipulable et lui donnent une conséquence visible.",
            focusTitle: "Six prototypes, six gestes",
            focus: "Le portefeuille réunit J01 à J06 : mots à croiser, mesures à comparer, territoires à aménager, sons à percevoir, systèmes à raccorder et preuves à examiner. Chaque prototype reste autonome, sans compte obligatoire.",
            questions: ["Quelle action rend l’idée du texte sensible ?", "Quelles hypothèses et limites le jeu doit-il montrer ?", "Quel retour au texte donne envie de poursuivre la réflexion ?"],
            gameTarget: "arcade",
            gameLabel: "Ouvrir les jeux du Laboratoire ludique"
          }
        }
      ];
