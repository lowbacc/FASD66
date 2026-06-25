# FASD66

Site vitrine statique pour l’association FASD, avec une interface d’administration connectée à Supabase.

## Contenu

- Pages publiques pour la défense physique, la défense intellectuelle, les projets, les ressources et le contact.
- Interface admin pour créer, modifier et supprimer des posts, projets, ressources et signalements.
- Cache applicatif via `service-worker.js`.
- Publication des contenus via la base Supabase.

## Arborescence

- `index.html` : accueil.
- `physique*.html` et `intellectuelle*.html` : pages publiques.
- `projets.html` et `ressources.html` : contenus Supabase côté public.
- `admin-dashboard.html` et `admin-login.html` : administration.
- `main.js` : logique partagée du site et de l’admin.
- `styles.css` : styles globaux.
- `manifest.json` : configuration PWA.
- `service-worker.js` : cache des assets statiques.
- `assets/` : logos et médias.

## Données Supabase

Le projet s’appuie sur au moins ces tables :

- `posts`
- `projects`
- `resources`
- `reports`

## Déploiement local

Le site fonctionne comme un ensemble de fichiers statiques. Ouvre simplement `index.html` dans un serveur local ou dans ton hébergeur habituel.

## Points à connaître

- Les liens saisis dans les descriptions de posts sont rendus cliquables automatiquement.
- L’admin permet maintenant de modifier un post existant sans le recréer.
- Le manifeste utilise `assets/logo.svg` comme icône unique tant que les PNG dédiés ne sont pas ajoutés.
