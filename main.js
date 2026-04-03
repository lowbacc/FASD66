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
      }// main.js : tactile, clavier et gestion du focus pour la version à deux images + formulaire(s)
// + gestion upload d'images pour posts ET projets (Supabase Storage)

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     LOGO WRAP (animations tactiles / clavier)
  --------------------------------------------------------- */
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
    }, { passive: false });

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

  /* ---------------------------------------------------------
     FORMULAIRES CONTACT
  --------------------------------------------------------- */
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

  handleForm('contactForm');
  handleForm('contactFormPhys');

  /* ---------------------------------------------------------
     ADMIN — UPLOAD IMAGE POSTS
  --------------------------------------------------------- */
  const postForm = document.getElementById('postForm');
  if (postForm) {
    const supabaseClient = window.supabaseClient || null;

    const fileInput = document.getElementById('imageFile');
    const urlInput = document.getElementById('imageUrl');
    const previewWrap = document.getElementById('previewWrap');

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

    async function uploadImageAndGetUrl(file, folder = "posts") {
      if (!file) return null;
      if (!supabaseClient) throw new Error('Supabase non initialisé.');

      const MAX_MB = 6;
      if (file.size > MAX_MB * 1024 * 1024) {
        throw new Error(`Image trop lourde. Max ${MAX_MB} Mo.`);
      }

      const rawExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const ext = rawExt.replace(/[^a-z0-9]/gi, '') || 'jpg';
      const uuid = crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random();
      const filename = `${folder}/${Date.now()}-${uuid}.${ext}`;

      const BUCKET = 'images';

      const { error: uploadError } = await supabaseClient
        .storage
        .from(BUCKET)
        .upload(filename, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicData, error: publicError } = supabaseClient
        .storage
        .from(BUCKET)
        .getPublicUrl(filename);

      if (publicError) throw publicError;

      return publicData.publicUrl;
    }

    postForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = (postForm.querySelector('#postTitle') || {}).value?.trim?.() || '';
      const content = (postForm.querySelector('#postContent') || {}).value?.trim?.() || '';
      const location = (postForm.querySelector('#postLocation') || {}).value || null;
      const urlField = urlInput ? urlInput.value.trim() : '';
      const file = fileInput ? fileInput.files[0] : null;

      if (!title) return alert("Merci de renseigner un titre.");
      if (!location) return alert("Merci de choisir un emplacement.");

      try {
        let imageUrl = null;

        if (file) {
          const btn = postForm.querySelector('button[type="submit"]');
          const old = btn.textContent;
          btn.disabled = true;
          btn.textContent = "Upload…";

          imageUrl = await uploadImageAndGetUrl(file, "posts");

          btn.disabled = false;
          btn.textContent = old;
        } else if (urlField) {
          imageUrl = urlField;
        }

        const { error } = await supabaseClient
          .from("posts")
          .insert({ title, content, image_url: imageUrl, location });

        if (error) throw error;

        postForm.reset();
        previewWrap.innerHTML = "";
        loadPosts();

      } catch (err) {
        console.error(err);
        alert("Erreur : " + err.message);
      }
    });
  }

  /* ---------------------------------------------------------
     ADMIN — UPLOAD IMAGE PROJETS
  --------------------------------------------------------- */
  const projectForm = document.getElementById("projectForm");
  if (projectForm) {
    const supabaseClient = window.supabaseClient || null;

    const projectImageFile = document.getElementById("projectImageFile");
    const projectImage = document.getElementById("projectImage");
    const projectPreviewWrap = document.getElementById("projectPreviewWrap");

    if (projectImageFile && projectPreviewWrap) {
      projectImageFile.addEventListener("change", () => {
        projectPreviewWrap.innerHTML = "";
        const file = projectImageFile.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
          projectPreviewWrap.textContent = "Fichier non image.";
          return;
        }
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.style.maxWidth = "240px";
        img.style.maxHeight = "160px";
        img.style.borderRadius = "6px";
        img.onload = () => URL.revokeObjectURL(img.src);
        projectPreviewWrap.appendChild(img);
      });
    }

    projectForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const file = projectImageFile ? projectImageFile.files[0] : null;
      const urlField = projectImage ? projectImage.value.trim() : "";
      let imageUrl = null;

      try {
        if (file) {
          const btn = projectForm.querySelector('button[type="submit"]');
          const old = btn.textContent;
          btn.disabled = true;
          btn.textContent = "Upload…";

          imageUrl = await uploadImageAndGetUrl(file, "projects");

          btn.disabled = false;
          btn.textContent = old;
        } else if (urlField) {
          imageUrl = urlField;
        }

        const { error } = await supabaseClient
          .from("projects")
          .insert({
            title: projectTitle.value,
            status: projectStatus.value,
            start_date: projectStart.value,
            end_date: projectEnd.value || null,
            image: imageUrl,
            link: projectLink.value || null,
            description: projectDescription.value
          });

        if (error) throw error;

        projectForm.reset();
        if (projectPreviewWrap) projectPreviewWrap.innerHTML = "";
        loadProjects();

      } catch (err) {
        console.error(err);
        alert("Erreur upload : " + err.message);
      }
    });
  }

  /* ---------------------------------------------------------
     MENU BURGER
  --------------------------------------------------------- */
  const burger = document.querySelector(".nav-burger");
  const navMenu = document.querySelector(".nav-menu");

  if (burger) {
    burger.addEventListener("click", () => {
      if (navMenu) navMenu.classList.toggle("open");
    });
  }

  /* ---------------------------------------------------------
     SOUS-MENUS MOBILE
  --------------------------------------------------------- */
  const submenuToggles = document.querySelectorAll(".submenu-toggle");

  submenuToggles.forEach(toggle => {
    toggle.addEventListener("click", (e) => {
      if (window.innerWidth <= 900) {
        const parent = toggle.parentElement;
        const submenu = parent.querySelector(".submenu");
        if (submenu) submenu.classList.toggle("open");
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (window.innerWidth > 900) return;
    if (!e.target.closest(".nav-menu") && !e.target.closest(".nav-burger")) {
      if (navMenu) navMenu.classList.remove("open");
      document.querySelectorAll(".submenu.open").forEach(sm => sm.classList.remove("open"));
    }
  });

  /* ---------------------------------------------------------
     CONTACT — DROPDOWN
  --------------------------------------------------------- */
  const dropdownBtn = document.querySelector(".dropdown-btn");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener("click", () => {
      dropdownMenu.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".contact-dropdown")) {
        dropdownMenu.classList.remove("open");
      }
    });
  }

  /* ---------------------------------------------------------
     CONTACT — AFFICHAGE FORMULAIRES
  --------------------------------------------------------- */
  const formPhys = document.querySelector(".contact-form-phys");
  const formIntel = document.querySelector(".contact-form-intel");

  if (dropdownMenu) {
    dropdownMenu.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        const choice = btn.dataset.branch;

        dropdownBtn.textContent = btn.textContent;
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

}); // FIN DOMContentLoaded
