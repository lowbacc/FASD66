// main.js : tactile, clavier et gestion du focus pour la version à deux images
document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('logoWrap');
  if (!wrap) return;

  // tactile : premier tap active la séparation, second tap permet le clic sur la zone
  let touched = false;
  wrap.addEventListener('touchstart', (e) => {
    if (!touched) {
      wrap.classList.add('touched');
      touched = true;
      e.preventDefault(); // empêche le lien d'être suivi immédiatement
      // réinitialise après 4s pour éviter blocage
      setTimeout(() => { touched = false; wrap.classList.remove('touched'); }, 4000);
    }
    // si touched === true, on laisse le navigateur suivre le lien si l'utilisateur tape sur une .half
  }, {passive:false});

  // clavier : Enter ou Espace active/désactive la séparation
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      wrap.classList.toggle('touched');
    }
    // Escape pour annuler
    if (e.key === 'Escape') {
      wrap.classList.remove('touched');
    }
  });

  // clic en dehors : retire la classe touched
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) {
      wrap.classList.remove('touched');
      touched = false;
    }
  });

  // si l'utilisateur clique sur une .half alors que touched=false,
  // on active touched d'abord (utile sur desktop si l'utilisateur clique directement)
  const halves = wrap.querySelectorAll('.half');
  halves.forEach(h => {
    h.addEventListener('click', (ev) => {
      if (!wrap.classList.contains('touched')) {
        ev.preventDefault();
        wrap.classList.add('touched');
        // si l'utilisateur clique à nouveau sur la même moitié dans les 3s, on suit le lien
        setTimeout(() => { wrap.classList.remove('touched'); }, 3000);
      }
    });
  });
});
