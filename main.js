// main.js : gère le comportement tactile (mobile) et l'accessibilité clavier
document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('logoWrap');

  // Toggle tactile : premier tap active la séparation, second tap permet le clic sur la zone
  let touched = false;
  wrap.addEventListener('touchstart', (e) => {
    if (!touched) {
      wrap.classList.add('touched');
      touched = true;
      // Empêche le lien d'être suivi immédiatement
      e.preventDefault();
      // Après 4s on réinitialise pour éviter blocage
      setTimeout(() => { touched = false; wrap.classList.remove('touched'); }, 4000);
    }
    // Si touched === true, on laisse le navigateur suivre le lien si l'utilisateur tape sur une zone cliquable
  }, {passive:false});

  // Support clavier : Enter pour activer/désactiver la séparation
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      wrap.classList.toggle('touched');
    }
  });

  // Si l'utilisateur clique en dehors, on retire la classe touched
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) {
      wrap.classList.remove('touched');
      touched = false;
    }
  });
});
