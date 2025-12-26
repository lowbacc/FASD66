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

/* ---------------------------------------------------------
   MENU BURGER (MOBILE)
--------------------------------------------------------- */

const burger = document.querySelector(".nav-burger");
const navMenu = document.querySelector(".nav-menu");

if (burger) {
  burger.addEventListener("click", () => {
    navMenu.classList.toggle("open");
  });
}

/* ---------------------------------------------------------
   SOUS-MENUS SUR MOBILE (clic)
--------------------------------------------------------- */

const submenuToggles = document.querySelectorAll(".submenu-toggle");

submenuToggles.forEach(toggle => {
  toggle.addEventListener("click", (e) => {
    // Seulement sur mobile
    if (window.innerWidth <= 900) {
      const parent = toggle.parentElement;
      const submenu = parent.querySelector(".submenu");
      submenu.classList.toggle("open");
    }
  });
});

/* ---------------------------------------------------------
   FERMETURE DU MENU SI ON CLIQUE AILLEURS (mobile)
--------------------------------------------------------- */

document.addEventListener("click", (e) => {
  if (window.innerWidth > 900) return; // seulement mobile

  if (!e.target.closest(".nav-menu") && !e.target.closest(".nav-burger")) {
    navMenu.classList.remove("open");

    // fermer tous les sous-menus
    document.querySelectorAll(".submenu.open").forEach(sm => {
      sm.classList.remove("open");
    });
  }
});

/* ---------------------------------------------------------
   PAGE CONTACT — DROPDOWN STYLÉ (Option D2)
--------------------------------------------------------- */

const dropdownBtn = document.querySelector(".dropdown-btn");
const dropdownMenu = document.querySelector(".dropdown-menu");

if (dropdownBtn && dropdownMenu) {
  dropdownBtn.addEventListener("click", () => {
    dropdownMenu.classList.toggle("open");
  });

  // Fermer si clic ailleurs
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".contact-dropdown")) {
      dropdownMenu.classList.remove("open");
    }
  });
}

/* ---------------------------------------------------------
   PAGE CONTACT — AFFICHAGE DES FORMULAIRES
--------------------------------------------------------- */

const formPhys = document.querySelector(".contact-form-phys");
const formIntel = document.querySelector(".contact-form-intel");

if (dropdownMenu) {
  dropdownMenu.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const choice = btn.dataset.choice;

      dropdownBtn.textContent = btn.textContent; // mettre le texte choisi

      dropdownMenu.classList.remove("open");

      if (choice === "physique") {
        formPhys.style.display = "block";
        formIntel.style.display = "none";
      } else if (choice === "intellectuelle") {
        formPhys.style.display = "none";
        formIntel.style.display = "block";
      }
    });
  });
}

/* ---------------------------------------------------------
   ANCRE AUTOMATIQUE (#physique / #intellectuelle)
   Quand on arrive depuis le menu
--------------------------------------------------------- */

if (window.location.hash === "#physique" && formPhys) {
  formPhys.style.display = "block";
  formIntel.style.display = "none";
  dropdownBtn.textContent = "Défense Physique";
}

if (window.location.hash === "#intellectuelle" && formIntel) {
  formIntel.style.display = "block";
  formPhys.style.display = "none";
  dropdownBtn.textContent = "Défense Intellectuelle";
}
