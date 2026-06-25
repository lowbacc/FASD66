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
