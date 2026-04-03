// main.js : tactile, clavier et gestion du focus pour la version à deux images + formulaire(s)
// + gestion optionnelle de l'upload d'images pour le formulaire admin (Supabase Storage)
// NOTE : la partie Supabase ne s'exécute que si un client Supabase est disponible sur window.supabaseClient

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

  /* ---------------------------------------------------------
     ADMIN : upload d'image vers Supabase Storage (optionnel)
     - Ne s'active que si un formulaire #postForm existe
     - Et si window.supabaseClient est défini (client Supabase initialisé)
  --------------------------------------------------------- */

  const postForm = document.getElementById('postForm');
  if (postForm) {
    // Vérifier la présence du client Supabase
    const supabaseClient = window.supabaseClient || null;
    if (!supabaseClient) {
      // Si le client n'est pas présent, on laisse le formulaire fonctionner avec URL seulement
      console.warn('Supabase client introuvable sur window.supabaseClient — upload d\'image désactivé.');
    }

    const fileInput = document.getElementById('imageFile');
    const urlInput = document.getElementById('imageUrl');
    const previewWrap = document.getElementById('previewWrap');

    // Aperçu local du fichier sélectionné
    if (fileInput && previewWrap) {
      fileInput.addEventListener('change', () => {
        previewWrap.innerHTML = '';
        const file = fileInput.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
          previewWrap.textContent = 'Fichier non image.';
          return;
        }
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.style.maxWidth = '240px';
        img.style.maxHeight = '160px';
        img.style.borderRadius = '6px';
        img.onload = () => URL.revokeObjectURL(img.src);
        previewWrap.appendChild(img);
      });
    }

    // Helper : upload et récupération d'URL publique (si supabaseClient présent)
    async function uploadImageAndGetUrl(file) {
      if (!file) return null;
      if (!supabaseClient) throw new Error('Supabase client non initialisé.');

      const MAX_MB = 6;
      if (file.size > MAX_MB * 1024 * 1024) {
        throw new Error(`Image trop lourde. Max ${MAX_MB} Mo.`);
      }

      // Générer un nom de fichier sûr et unique
      const rawExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const ext = rawExt.replace(/[^a-z0-9]/gi, '') || 'jpg';
      const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + '-' + Math.floor(Math.random() * 1e6);
      const filename = `posts/${Date.now()}-${uuid}.${ext}`;

      // Nom du bucket (à adapter si nécessaire)
      const BUCKET = 'images';

      // Upload
      const { data: uploadData, error: uploadError } = await supabaseClient
        .storage
        .from(BUCKET)
        .upload(filename, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        // Si le fichier existe déjà et upsert=false, Supabase renverra une erreur ; on la propage
        throw uploadError;
      }

      // Récupérer URL publique (si bucket public)
      const { data: publicData, error: publicError } = supabaseClient
        .storage
        .from(BUCKET)
        .getPublicUrl(filename);

      if (publicError) {
        // Si erreur, on renvoie quand même le chemin interne pour debug
        throw publicError;
      }

      return publicData.publicUrl;
    }

    // Soumission du formulaire admin
    postForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = (postForm.querySelector('#title') || {}).value?.trim?.() || '';
      const content = (postForm.querySelector('#content') || {}).value?.trim?.() || '';
      const urlField = urlInput ? urlInput.value.trim() : '';
      const file = fileInput ? fileInput.files[0] : null;

      // Validation minimale
      if (!title) {
        alert('Merci de renseigner un titre.');
        return;
      }

      try {
        let imageUrl = null;

        // Priorité : fichier uploadé > URL manuelle
        if (file) {
          if (!supabaseClient) {
            alert('Impossible d\'uploader l\'image : Supabase non initialisé. Utilisez une URL ou initialisez le client.');
            return;
          }
          // Indicateur simple (on peut améliorer avec une barre de progression)
          const submitBtn = postForm.querySelector('button[type="submit"]');
          const originalText = submitBtn ? submitBtn.textContent : null;
          if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Upload en cours…'; }

          imageUrl = await uploadImageAndGetUrl(file);

          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
        } else if (urlField) {
          imageUrl = urlField;
        }

        // Insérer le post dans Supabase si le client est présent
        if (!supabaseClient) {
          // Si pas de client, on simule un enregistrement local (ou on peut envoyer via fetch vers un endpoint)
          alert('Supabase non initialisé : le post n\'a pas été envoyé. (Test local)');
          postForm.reset();
          if (previewWrap) previewWrap.innerHTML = '';
          return;
        }

        const { error } = await supabaseClient
          .from('posts')
          .insert({
            title,
            content,
            image_url: imageUrl,
            // adapter la colonne location selon ton usage ; ici on laisse vide ou on peut ajouter un champ select
            location: postForm.dataset.location || null
          });

        if (error) throw error;

        alert('Post publié.');
        postForm.reset();
        if (previewWrap) previewWrap.innerHTML = '';
      } catch (err) {
        console.error(err);
        alert('Erreur : ' + (err.message || JSON.stringify(err)));
      }
    });
  } // fin bloc postForm
}); // fin DOMContentLoaded

/* ---------------------------------------------------------
   MENU BURGER (MOBILE)
--------------------------------------------------------- */

const burger = document.querySelector(".nav-burger");
const navMenu = document.querySelector(".nav-menu");

if (burger) {
  burger.addEventListener("click", () => {
    if (navMenu) navMenu.classList.toggle("open");
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
      if (submenu) submenu.classList.toggle("open");
    }
  });
});

/* ---------------------------------------------------------
   FERMETURE DU MENU SI ON CLIQUE AILLEURS (mobile)
--------------------------------------------------------- */

document.addEventListener("click", (e) => {
  if (window.innerWidth > 900) return; // seulement mobile

  if (!e.target.closest(".nav-menu") && !e.target.closest(".nav-burger")) {
    if (navMenu) navMenu.classList.remove("open");

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
      const choice = btn.dataset.branch;

      dropdownBtn.textContent = btn.textContent; // mettre le texte choisi

      dropdownMenu.classList.remove("open");

      if (choice === "physique") {
        if (formPhys) formPhys.style.display = "block";
        if (formIntel) formIntel.style.display = "none";
      } else if (choice === "intellectuelle") {
        if (formPhys) formPhys.style.display = "none";
        if (formIntel) formIntel.style.display = "block";
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
  if (formIntel) formIntel.style.display = "none";
  if (dropdownBtn) dropdownBtn.textContent = "Défense Physique";
}

if (window.location.hash === "#intellectuelle" && formIntel) {
  formIntel.style.display = "block";
  if (formPhys) formPhys.style.display = "none";
  if (dropdownBtn) dropdownBtn.textContent = "Défense Intellectuelle";
}
