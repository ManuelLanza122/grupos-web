/********************************
 * CONFIGURACIÓN SUPABASE
 ********************************/
const SUPABASE_URL = "https://vxnfbrgafuwtoltxuwtj.supabase.co";
const SUPABASE_KEY = "sb_publishable_nGWxhy5B8Lo1EObzK72cvg_TksWevuo";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/********************************
 * AUTH
 ********************************/
async function register() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Completa email y contraseña");
    return;
  }

  const { error } = await supabase.auth.signUp({ email, password });
  alert(error ? error.message : "Registro exitoso, ahora inicia sesión");
}

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) alert(error.message);
  else location.href = "panel.html";
}

async function logout() {
  await supabase.auth.signOut();
  location.href = "index.html";
}

/********************************
 * PUBLICAR GRUPO (RECIBO)
 ********************************/
async function addGroup() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    alert("Debes iniciar sesión");
    return;
  }

  const name = gid("name").value.trim();
  const link = gid("link").value.trim();
  const category = gid("category").value.trim();

  if (!name || !link) {
    alert("Completa los campos obligatorios");
    return;
  }

  const { data: inserted, error } = await supabase
    .from("groups")
    .insert([{
      name,
      link,
      category,
      owner: user.id,
      verified: false
    }])
    .select();

  if (error) {
    alert(error.message);
    return;
  }

  const receipt = inserted[0].id;

  alert(
    "✅ Grupo enviado correctamente\n\n" +
    "🧾 RECIBO:\n" + receipt + "\n\n" +
    "Estado: ⏳ Pendiente de aprobación"
  );

  gid("name").value = "";
  gid("link").value = "";
  gid("category").value = "";

  loadMyGroups();
}

/********************************
 * MIS GRUPOS (USUARIO)
 ********************************/
async function loadMyGroups() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return;

  const { data: groups, error } = await supabase
    .from("groups")
    .select("*")
    .eq("owner", user.id)
    .order("created_at", { ascending: false });

  if (error) return;

  const box = document.getElementById("myGroups");
  if (!box) return;

  box.innerHTML = "";

  groups.forEach(g => {
    box.innerHTML += `
      <div class="card">
        <h3>${g.name}</h3>
        <p>${g.category || "-"}</p>
        <p class="${g.verified ? 'status-ok' : 'status-wait'}">
          ${g.verified ? "✅ Aprobado" : "⏳ Pendiente"}
        </p>
        <small>🧾 Recibo: ${g.id}</small>
      </div>
    `;
  });
}

/********************************
 * GRUPOS PÚBLICOS
 ********************************/
async function loadGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("verified", true)
    .order("views", { ascending: false });

  if (error) return;

  const container = document.getElementById("groups");
  if (!container) return;

  container.innerHTML = "";

  data.forEach(g => {
    container.innerHTML += `
      <div class="card">
        <h3>${g.name}</h3>
        <p>${g.category || ""}</p>
        <a href="${g.link}" target="_blank"
           onclick="addView('${g.id}')">Entrar</a>
      </div>
    `;
  });
}

/********************************
 * CONTADOR DE VISITAS
 ********************************/
async function addView(id) {
  await supabase.rpc("add_view", { gid: id });
}

/********************************
 * BUSCADOR
 ********************************/
function searchGroups() {
  const q = gid("search").value.toLowerCase();
  document.querySelectorAll(".card").forEach(c => {
    c.style.display = c.innerText.toLowerCase().includes(q)
      ? "block"
      : "none";
  });
}

/********************************
 * HELPERS
 ********************************/
function gid(id) { return document.getElementById(id); }

/********************************
 * AUTO LOAD
 ********************************/
document.addEventListener("DOMContentLoaded", () => {
  loadGroups();
  loadMyGroups();
});
