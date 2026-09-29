# Effectifs partagés et import de club

Les équipes B et C peuvent utiliser un même joueur sans dupliquer sa fiche :
`teamId` reste son effectif principal, `rosterTeamIds` contient les effectifs
supplémentaires autorisés. Le groupe « Pool B/C » est un rangement d'effectif,
pas une quatrième équipe de compétition. Les notes et évaluations restent
rattachées au même identifiant de joueur.

## Migration et import

`prisma/maintenance/20260929_usb_rosters.sql` est une migration SQL additive,
idempotente, exécutée au démarrage après la maintenance précédente. Elle rend
facultatifs la naissance et le numéro de maillot, ajoute les rattachements et
la provenance des notes, et crée le journal d'import.

Le fichier personnel d'import reste hors du dépôt, avec des permissions 0600.
Il contient l'inventaire exact des identifiants de démonstration à remplacer,
les profils source et les estimations. Ne jamais versionner ce fichier, le
classeur source, une sauvegarde de base ou des notes médicales.

1. Sauvegarder la base avec pg_dump et conserver les images précédentes.
2. Appliquer la migration et vérifier les services.
3. `npx tsx scripts/import-club.ts /private/payload.json` : contrôle sans écriture.
4. `npx tsx scripts/import-club.ts /private/payload.json --apply` : transaction.
5. Vérifier les effectifs, les autorisations et les fiches dans l'interface.

L'import de cette saison attend 37 personnes : noyaux 7/5/5 et pool de 20.
Les effectifs disponibles sont donc A=7, B=25, C=25, avec 37 personnes uniques.
Le script refuse un inventaire différent ou une réutilisation de la clé avec
un autre fichier. Une seconde exécution du même fichier est sans effet.
Les anciens joueurs, séances, évaluations et comptes de démonstration de
l'organisation inventoriée sont remplacés ; les exercices restent disponibles.
Aucune opération d'import n'est déclenchée automatiquement au démarrage.

## Notes initiales

`ESTIMATED` indique une estimation fondée sur le niveau qualitatif et les
postes possibles, pas un test réalisé. Aucune mesure physique n'est inventée.
La fiche permet de modifier les six catégories techniques, la note globale,
le potentiel, les points forts et axes de travail. La case de confirmation
applique les notes et passe le profil à `COACH_REVIEWED`. Modifier uniquement
les coordonnées ne confirme pas les notes. La première évaluation complète
remplace les estimations au lieu de les mélanger aux résultats mesurés.

## Limites restant à traiter

L'analyse automatique vidéo n'est pas opérationnelle (service sans point
d'entrée). Il n'existe pas de synchronisation des collections Instagram
privées. Les liens vidéo de la bibliothèque peuvent être enregistrés, mais
le générateur historique utilise encore son catalogue local. Ces fonctionnalités
ne doivent pas être annoncées comme finalisées.
