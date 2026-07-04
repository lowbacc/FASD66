// post-renderer.js - Fonctions partagées pour le rendu des posts
// Utilisé par: intellectuelle-actu.html, physique-actu.html, intellectuelle-presse.html, physique-presse.html

// Initialiser Supabase (même clés pour tous)
const supabaseClient = supabase.createClient(
  "https://vanhcaicgzvavoqcnvbm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhbmhjYWljZ3p2YXZvcWNudmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNDgwNTQsImV4cCI6MjA4NDgyNDA1NH0.PG_hpNFzZH9zGAVngpgKYUnS8_9LO7PHY72ilGojAXU"
);

/**
 * Échappe les caractères HTML pour éviter les injections
 */
function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Valide et retourne une URL sécurisée
 */
function sanitizeUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value;
  return "";
}

/**
 * Convertit les URLs dans le texte en liens cliquables
 */
function renderTextWithLinks(text) {
  const value = String(text ?? "");
  const urlRegex = /(?:https?:\/\/|www\.)[^\s<]+/gi;
  let output = "";
  let lastIndex = 0;
  let match;

  while ((match = urlRegex.exec(value)) !== null) {
    const rawUrl = match[0];
    let url = rawUrl;
    let trailing = "";

    while (/[.,!?;:)\]]$/.test(url)) {
      trailing = url.slice(-1) + trailing;
      url = url.slice(0, -1);
    }

    output += escapeHtml(value.slice(lastIndex, match.index));

    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    output += `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`;
    output += escapeHtml(trailing);

    lastIndex = match.index + rawUrl.length;
  }

  output += escapeHtml(value.slice(lastIndex));
  return output.replace(/\n/g, "<br>");
}

/**
 * Charge et affiche les posts depuis Supabase
 * @param {string} location - Valeur de location: "intellectuelle-actu", "physique-actu", etc.
 */
async function loadPostsByLocation(location) {
  const { data, error } = await supabaseClient
    .from("posts")
    .select("*")
    .eq("location", location)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  const container = document.createElement("div");
  container.style.marginTop = "2rem";

  if (error || !data || data.length === 0) {
    container.innerHTML = "<p>Aucun article pour le moment.</p>";
    document.querySelector(".page-content").appendChild(container);
    return;
  }

  data.forEach(post => {
    const div = document.createElement("div");
    div.style.padding = "1rem";
    div.style.margin = "1rem 0";
    div.style.background = "#1e1e1e";
    div.style.borderRadius = "6px";

    const date = new Date(post.created_at).toLocaleDateString("fr-FR");

    div.innerHTML = `
      <h3>${escapeHtml(post.title || "")}</h3>
      <p style="opacity:0.7;font-size:0.9rem;">Publié le ${date}</p>

      ${sanitizeUrl(post.image_url) ? `
        <img 
          src="${escapeHtml(sanitizeUrl(post.image_url))}" 
          alt="${escapeHtml(post.title || "")}" 
          style="width:100%;max-width:600px;border-radius:6px;margin:1rem 0;"
        >
      ` : ""}

      <p style="margin-top:0.5rem;">${renderTextWithLinks(post.content || "")}</p>

      <div style="margin-top:1rem; display:flex; gap:1rem;">
        <button class="btn share-btn" data-title="${escapeHtml(post.title || "")}" data-content="${escapeHtml(post.content || "")}">
          Partager
        </button>

        <button class="btn error-btn" data-title="${escapeHtml(post.title || "")}">
          Signaler une erreur
        </button>
      </div>
    `;

    container.appendChild(div);
  });

  document.querySelector(".page-content").appendChild(container);
}

/**
 * Gère l'événement de partage d'un post
 */
function handleShareClick(title, content) {
  const url = window.location.href;
  const text = `${title}\n\n${content}`;

  if (navigator.share) {
    navigator.share({ title, text, url });
  } else {
    const message = `${title}\n${url}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      alert("Copié dans le presse-papiers !");
    }
  }
}

/**
 * Gère l'événement de signalement d'une erreur
 */
async function handleErrorReport(postTitle) {
  const description = prompt("Décrivez l'erreur :");
  if (!description) return;

  const { error } = await supabaseClient
    .from("reports")
    .insert([
      {
        page_source: window.location.pathname,
        description: description,
        post_title: postTitle,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
    ]);

  if (error) {
    alert("Erreur lors du signalement : " + error.message);
    return;
  }

  alert("Merci ! L'erreur a été signalée.");
}
