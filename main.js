// main.js : tactile, clavier et gestion du focus pour la version à deux images + formulaire(s)
// + upload images posts & projets (Supabase Storage)
// + conversion HEIC/HEIF → JPG (fix iPhone)
// + limite augmentée à 20 Mo
// + messages d’erreur améliorés

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     LOGO WRAP
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
     FONCTION : conversion HEIC → JPG
  --------------------------------------------------------- */
  async function convertHeicToJpeg(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject("Conversion HEIC → JPG impossible");
              resolve(new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg" }));
            },
            "image/jpeg",
            0.9
          );
        };
        img.src = e.target.result;
      };
      reader.onerror = reject;

      try {
        reader.readAsDataURL(file);
      } catch (e) {
        reject("Impossible de lire le fichier (trop lourd ou format non supporté)");
      }
    });
  }

  /* ---------------------------------------------------------
     FONCTION : upload image vers Supabase
  --------------------------------------------------------- */
  async function uploadImageAndGetUrl(file, folder = "posts") {
    const supabaseClient = window.supabaseClient;
    if (!supabaseClient) throw new Error("Supabase non initialisé.");

    if (!file) return null;

    const MAX_MB = 20; // ← FIX iPhone
    if (file.size > MAX_MB * 1024 * 1024) {
      throw new Error(`Image trop lourde (${(file.size/1024/1024).toFixed(1)} Mo). Max ${MAX_MB} Mo.`);
    }

    // EXTENSION
    let rawExt = (file.name.split('.').pop() || 'jpg').toLowerCase();

    // FIX MOBILE HEIC
    if (rawExt === "heic" || rawExt === "heif") {
      console.warn("Conversion HEIC/HEIF → JPG");
      file = await convertHeicToJpeg(file);
      rawExt = "jpg";
    }

    const ext = rawExt.replace(/[^a-z0-9]/gi, '') || 'jpg';
    const uuid = crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random();
    const filename = `${folder}/${Date.now()}-${uuid}.${ext}`;

    const BUCKET = "images";

    if (!supabaseClient.storage) {
      throw new Error("Supabase Storage inaccessible (clé invalide ou projet incorrect)");
    }

    const { error: uploadError } = await supabaseClient
      .storage
      .from(BUCKET)
      .upload(filename, file, { cacheControl: "3600", upsert: false });

    if (uploadError) throw uploadError;

    const { data: publicData, error: publicError } = supabaseClient
      .storage
      .from(BUCKET)
      .getPublicUrl(filename);

    if (publicError) throw publicError;

    return publicData.publicUrl;
  }

  // NOTE: Code admin pour POST et PROJETS déplacé dans admin-dashboard.html
  // pour éviter la duplication et les conflits. Voir admin-dashboard.html pour
  // la gestion des formulaires de création/modification de posts et projets.

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
          formPhys.style.display = "block";
          formIntel.style.display = "none";
        } else {
          formPhys.style.display = "none";
          formIntel.style.display = "block";
        }
      });
    });
  }

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

}); // FIN DOMContentLoaded
