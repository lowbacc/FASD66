-- Migration pour ajouter un ordre manuel aux posts
-- À exécuter une seule fois dans Supabase SQL Editor

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS sort_order integer;

-- Remplit les valeurs existantes sans casser l'ordre actuel
-- L'ordre est basé sur created_at DESC pour conserver le comportement visuel existant
WITH ranked_posts AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY location
      ORDER BY created_at DESC, id DESC
    ) AS new_sort_order
  FROM posts
)
UPDATE posts p
SET sort_order = ranked_posts.new_sort_order
FROM ranked_posts
WHERE p.id = ranked_posts.id
  AND p.sort_order IS NULL;

-- Optionnel mais conseillé : index pour accélérer le tri
CREATE INDEX IF NOT EXISTS posts_location_sort_order_idx
  ON posts (location, sort_order);
