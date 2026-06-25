#!/usr/bin/env python3
# Script de déduplica du code des pages de posts

import os

os.chdir(r"c:\Users\skals\FASD66")

# Fichiers à traiter
files_map = {
    "intellectuelle-actu.html": "intellectuelle-actu",
    "physique-actu.html": "physique-actu",
    "intellectuelle-presse.html": "intellectuelle-presse",
    "physique-presse.html": "physique-presse"
}

for file, location in files_map.items():
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Chercher les markers possibles (deux formats différents)
    start_marker1 = '  <!-- SCRIPT SUPABASE + LOGIQUE COMPLETE -->'
    start_marker2 = '  <!-- SUPABASE -->'
    end_marker = '  <script src="main.js"></script>'
    
    # Déterminer quel marker utiliser
    start_marker = None
    if start_marker1 in content:
        start_marker = start_marker1
    elif start_marker2 in content:
        start_marker = start_marker2
    
    if start_marker and end_marker in content:
        start_idx = content.find(start_marker)
        end_idx = content.find(end_marker) + len(end_marker)
        
        # Créer le nouveau script
        new_script = f'''  <!-- SCRIPT SUPABASE + LOGIQUE PARTAGÉE -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="post-renderer.js"></script>

  <script>
    // Charger les posts pour cette page
    loadPostsByLocation("{location}");

    // Gestion des boutons Partager et Signaler une erreur
    document.addEventListener("click", (e) => {{
      if (e.target.classList.contains("share-btn")) {{
        const title = e.target.dataset.title;
        const content = e.target.dataset.content;
        handleShareClick(title, content);
      }}

      if (e.target.classList.contains("error-btn")) {{
        const title = e.target.dataset.title;
        handleErrorReport(title);
      }}
    }});
  </script>

  <script src="main.js"></script>'''
        
        # Remplacer
        new_content = content[:start_idx] + new_script + content[end_idx:]
        
        # Écrire
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✓ {file} mise à jour")
    else:
        print(f"✗ {file} : markers non trouvés")

print("\nDéduplications terminées!")

