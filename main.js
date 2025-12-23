// main.js : tactile, clavier et gestion du focus pour la version à deux images + formulaire(s)
document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('logoWrap');
  if (wrap) {
    let touched = false;
    wrap.addEventListener('touchstart', (e) => {
      if (!touched) {
        wrap.classList.add('touched');
        touched = true;
        e.preventDefault();
        setTimeout(() => { touched = false; wrap.classList.remove('touched'); }, 4000);
      }
    }, {passive:false});

    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        wrap.classList.toggle('touched');
      }
      if (e.key === 'Escape') wrap.classList.remove('touched');
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) {
        wrap.classList.remove('touched');
        touched = false;
      }
    });

    const halves = wrap.querySelectorAll('.half');
    halves.forEach(h => {
      h.addEventListener('click', (ev) => {
        if (!wrap.classList.contains('touched')) {
          ev.preventDefault();
          wrap.classList.add('touched');
          setTimeout(() => { wrap.classList.remove('touched'); }, 3000);
        }
      });
    });
  }

  // Gestion des formulaires (plusieurs pages)
  const handleForm = (formId) => {
    const form = document.getElementById(formId);
    if (!form) return;
    const note = form.querySelector('.form-note');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        if (note) { note.textContent = 'Merci de compléter les champs requis.'; note.style.color = '#f6b0b0'; }
        return;
      }
      if (note) { note.textContent = 'Merci — votre demande a bien été reçue.'; note.style.color = '#bff0d6'; }
      form.reset();
    });
  };

  // forms on different pages
  handleForm('contactForm');       // intellectuelle
  handleForm('contactFormPhys');   // physique
});
