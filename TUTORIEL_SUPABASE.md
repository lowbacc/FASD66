# Tutoriel complet : Sécurisation FASD66 avec Supabase

## Table des matières
1. [Créer l'utilisateur admin](#créer-lutilisateur-admin)
2. [Appliquer les RLS policies](#appliquer-les-rls-policies)
3. [Tester en local](#tester-en-local)
4. [Déployer en production](#déployer-en-production)

---

## Créer l'utilisateur admin

### Étape 1 : Accéder à Supabase Dashboard

1. Ouvrez [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Connectez-vous avec votre compte
3. Sélectionnez le projet FASD66 (vanhcaicgzvavoqcnvbm)

### Étape 2 : Accédez à Authentication

Dans le menu de gauche, cliquez sur :
```
Authentication → Users
```

Vous devriez voir une page vide ou avec peu d'utilisateurs.

### Étape 3 : Créer un nouvel utilisateur

1. Cliquez sur le bouton **Invite user** (bouton bleu en haut à droite)
2. Remplissez le formulaire :

```
Email:          admin@fasd.fr  (ou votre email préféré)
Password:       SuperMotDePasse123!  (doit être fort!)
Confirm Password: SuperMotDePasse123!
```

**⚠️ Important**: 
- N'utilisez PAS `admin123` (trop faible)
- Utilisez un mot de passe avec au moins :
  - 8 caractères
  - 1 majuscule
  - 1 minuscule  
  - 1 chiffre
  - 1 caractère spécial

Exemple de bon mot de passe: `F@sd66Admin2025!`

### Étape 4 : Valider la création

3. Cliquez sur **Send invite**
4. L'utilisateur est créé et apparaît dans la liste

✅ **L'utilisateur admin est maintenant prêt!**

---

## Appliquer les RLS policies

Les RLS (Row Level Security) policies protègent vos données.

### Étape 1 : Ouvrir l'éditeur SQL

Dans le menu de gauche de Supabase Dashboard :
```
SQL Editor
```

### Étape 2 : Créer une nouvelle requête

1. Cliquez sur **+ New query**
2. En haut, donnez un nom : `SETUP_RLS_POLICIES`

### Étape 3 : Copier-coller le SQL

Ouvrez le fichier `rls-policies.sql` de votre projet FASD66 et copiez **tout le contenu**.

Collez-le dans l'éditeur SQL de Supabase.

Voici ce qu'il contient :

```sql
-- RLS Policies pour FASD66 - À exécuter dans Supabase SQL Editor
-- Cela protège les tables pour que seuls les utilisateurs authentifiés puissent modifier

-- 1. Activer RLS sur toutes les tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 2. POSTS - Tout le monde peut lire, seuls les utilisateurs authentifiés peuvent modifier
CREATE POLICY "posts_select_public" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert_authenticated" ON posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "posts_update_authenticated" ON posts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "posts_delete_authenticated" ON posts FOR DELETE USING (auth.role() = 'authenticated');

-- 3. PROJECTS - Tout le monde peut lire, seuls les utilisateurs authentifiés peuvent modifier
CREATE POLICY "projects_select_public" ON projects FOR SELECT USING (true);
CREATE POLICY "projects_insert_authenticated" ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "projects_update_authenticated" ON projects FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "projects_delete_authenticated" ON projects FOR DELETE USING (auth.role() = 'authenticated');

-- 4. RESOURCES - Tout le monde peut lire, seuls les utilisateurs authentifiés peuvent modifier
CREATE POLICY "resources_select_public" ON resources FOR SELECT USING (true);
CREATE POLICY "resources_insert_authenticated" ON resources FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "resources_update_authenticated" ON resources FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "resources_delete_authenticated" ON resources FOR DELETE USING (auth.role() = 'authenticated');

-- 5. REPORTS - Tout le monde peut lire, seuls les utilisateurs authentifiés peuvent modifier
CREATE POLICY "reports_select_public" ON reports FOR SELECT USING (true);
CREATE POLICY "reports_insert_authenticated" ON reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "reports_update_authenticated" ON reports FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "reports_delete_authenticated" ON reports FOR DELETE USING (auth.role() = 'authenticated');
```

### Étape 4 : Exécuter le SQL

1. En haut à droite, cliquez **Run** (ou Cmd+Enter)
2. Attendez un moment...
3. Vous devriez voir ✅ **Success** en bas

Si vous voyez une erreur de type "POLICY ... already exists", c'est normal - ça signifie que les policies existent déjà. Vous pouvez ignorer.

✅ **Les RLS policies sont maintenant appliquées!**

### Vérifier que c'est bien appliqué

1. Allez dans **Table Editor**
2. Sélectionnez une table (ex: `posts`)
3. En haut, vous devriez voir une icône 🔒 avec **RLS enabled**

---

## Tester en local

### Étape 1 : Démarrer votre application

Assurez-vous que votre site FASD66 est en local:
```
http://localhost:5000/admin-login.html
```

(Ajustez le port si vous utilisez un autre)

### Étape 2 : Test 1 - Authentification correcte

1. Allez sur http://localhost:5000/admin-login.html
2. Entrez vos identifiants :
   - Email: `admin@fasd.fr`
   - Password: `F@sd66Admin2025!` (le mot de passe que vous avez créé)
3. Cliquez **Se connecter**

✅ **Attendu** : Vous êtes redirigé vers le tableau de bord admin

📊 Le tableau de bord devrait afficher :
- Les posts existants
- Les projets existants
- Les ressources existantes
- Les signalements

### Étape 3 : Test 2 - Authentification incorrecte

1. Retournez à http://localhost:5000/admin-login.html
2. Entrez un mauvais mot de passe :
   - Email: `admin@fasd.fr`
   - Password: `wrong_password`
3. Cliquez **Se connecter**

❌ **Attendu** : Un message d'erreur s'affiche "Identifiants incorrects"

### Étape 4 : Test 3 - Créer un post (vérifier RLS)

1. Connectez-vous correctement
2. Remplissez le formulaire de création de post :
   ```
   Titre:       Test RLS
   Contenu:     Ceci est un test pour vérifier les RLS policies
   Où publier:  Actualités Défense Physique
   Lien image:  https://via.placeholder.com/600x400
   ```
3. Cliquez **Publier**

✅ **Attendu** : 
- Le post est créé avec succès
- Le post apparaît dans la liste
- Pas d'erreur Supabase

### Étape 5 : Test 4 - Modification (nouvelle fonctionnalité!)

1. Dans la liste des posts, cliquez le bouton **Modifier** 
2. Changez le titre en : "Test RLS - Modifié"
3. Cliquez **Mettre à jour**

✅ **Attendu** : 
- Le post est modifié avec succès
- Le titre change immédiatement

### Étape 6 : Test 5 - Vérifier que c'est impossible sans auth

1. Ouvrez la console du navigateur (F12)
2. Allez dans **Application** → **Local Storage**
3. Créez une clé `adminLoggedIn` avec valeur `true` (pour simuler l'ancien système)

⚠️ **Attendu** : 
- Même si vous aviez l'ancienne clé localStorage, les modifications ne doivent pas fonctionner
- Seule l'authentification Supabase valide pour les modifications

### Étape 7 : Test de déconnexion

1. Cliquez le bouton **Déconnexion**

✅ **Attendu** : 
- Vous êtes redirigé vers la page de login
- Votre session Supabase est terminée

---

## Déployer en production

### ⚠️ Prérequis

Avant de déployer :
- ✅ Les RLS policies sont appliquées dans Supabase
- ✅ L'utilisateur admin est créé dans Supabase
- ✅ Tous les tests locaux passent
- ✅ Vous connaissez le mot de passe admin par cœur

### Étape 1 : Vérifier les clés Supabase

Assurez-vous que vos clés Supabase dans les fichiers HTML sont correctes:

**À trouver**: 
- `admin-login.html` ligne ~17
- `admin-dashboard.html` ligne ~280
- `post-renderer.js` ligne ~9

Elles doivent être les mêmes et valides:
```
https://vanhcaicgzvavoqcnvbm.supabase.co
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhbmhjYWljZ3p2YXZvcWNudmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNDgwNTQsImV4cCI6MjA4NDgyNDA1NH0.PG_hpNFzZH9zGAVngpgKYUnS8_9LO7PHY72ilGojAXU
```

### Étape 2 : Déployer les fichiers

Selon votre plateforme :

**Netlify / Vercel / GitHub Pages :**
```bash
git add .
git commit -m "Sécurisation: Supabase Auth + RLS + Déduplications"
git push origin main
```

**Serveur perso :**
```bash
# Copier tous les fichiers vers votre serveur web
sftp user@server:/path/to/web/root
```

### Étape 3 : Vérifier en production

1. Accédez à votre URL en production : `https://fasd66.org/admin-login.html`
2. Connectez-vous avec vos identifiants admin
3. Testez la création d'un post
4. Testez la modification d'un post

### Étape 4 : Renforcer la sécurité (optionnel)

**Ajouter 2FA (Two-Factor Authentication) :**

1. Dans Supabase Dashboard → Authentication → Providers
2. Activez les options supplémentaires de sécurité

**Backup réguliers :**

1. Dans Supabase Dashboard → Backups
2. Gérez les sauvegardes automatiques

**Monitorer l'activité :**

1. Allez dans Analytics → Logs
2. Vérifiez régulièrement les tentatives de connexion suspectes

---

## FAQ & Dépannage

### Q: J'ai oublié mon mot de passe admin

**R:** 
1. Allez dans Supabase Dashboard → Authentication → Users
2. Cliquez sur l'utilisateur admin
3. Cliquez sur les 3 points → Reset password
4. L'utilisateur recevra un email pour réinitialiser

### Q: Les posts ne s'affichent pas après activation RLS

**R:** Les RLS policies génèrent une erreur ? Vérifiez:
1. `ALTER TABLE posts ENABLE ROW LEVEL SECURITY;` a été exécuté
2. Le policy `posts_select_public` existe (SELECT USING (true))
3. Rechargez la page

### Q: Le login ne fonctionne pas

**R:** Vérifiez:
1. L'utilisateur existe dans Supabase Dashboard → Authentication → Users
2. L'email et mot de passe sont corrects
3. Ouvrez la console (F12) et cherchez les erreurs Supabase
4. Vérifiez que les clés Supabase sont valides dans `admin-login.html`

### Q: Les modifications de posts ne fonctionnent plus!

**R:** 
1. Vérifiez que vous êtes bien connecté (vous devriez voir "Déconnexion")
2. Vérifiez que les RLS policies ont été appliquées
3. Dans la Console du navigateur (F12), cherchez les erreurs Supabase
4. Si l'erreur dit "new row violates row security policy", les RLS policies ne sont pas correctes

### Q: Puis-je utiliser un autre email pour l'admin?

**R:** Oui! Remplacez simplement `admin@fasd.fr` par votre email. Changez aussi dans `admin-login.html` si vous avez commentaires.

### Q: Je veux ajouter d'autres administrateurs

**R:**
1. Allez dans Supabase Dashboard → Authentication → Users
2. Cliquez **Invite user** pour chaque admin
3. Les RLS policies s'appliqueront automatiquement

---

## Résumé des changements

| Service | Avant | Après |
|---------|-------|-------|
| **Authentication** | Client-side (localStorage) | Supabase Auth (serveur) |
| **Database Security** | Aucune (accès public) | RLS policies (authentifiés only) |
| **Mot de passe admin** | En dur dans admin-login.html | Stocké sécurisé dans Supabase |
| **Code duplication** | 450 lignes dupliquées | Centralisé dans post-renderer.js |
| **Modification de posts** | ❌ Non | ✅ Oui (nouvelle feature!) |

---

## Prochaines étapes optionnelles

1. **Audit de sécurité** : Utiliser OWASP Top 10 checklist
2. **Logs d'activité** : Tracker les modifications avec des timestamps
3. **Backup automatiques** : Configurer dans Supabase
4. **Monitoring** : Alertes si modifications suspectes
5. **API REST** : Exposer certains endpoints côté client

---

## Support

Pour plus d'aide :
- 📖 [Documentation Supabase Auth](https://supabase.com/docs/guides/auth/overview)
- 🔐 [Documentation Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- 💬 [Comunauté Supabase Discord](https://discord.supabase.com)

Bonne chance! 🚀
