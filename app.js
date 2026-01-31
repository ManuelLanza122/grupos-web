/***********************
 * CONFIGURACIÓN SUPABASE
 ***********************/
const SUPABASE_URL = "https://vxnfbrgafuwtoltxuwtj.supabase.co";
const SUPABASE_KEY = "sb_publishable_nGWxhy5B8Lo1EObzK72cvg_TksWevuo";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/***********************
 * AUTH
 ***********************/
async function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    alert(error.message);
  } else {
    alert("Registro exitoso, ahora inicia sesión");
  }
}

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
  } else {
    window.location.href = "panel.html";
  }
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}

/***********************
 * GRUPOS
 ***********************/
async function addGroup() {
  const userData = await supabase.auth.getUser();
  const user = userData.data.user;

  if (!user) {
    alert("Debes iniciar sesión");
    return;
  }

  const name = document.getElementById("name").value;
  const link = document.getElementById("link").value;
  const category = document.getElementById("category").value;

  if (!name || !link) {
    alert("Completa todos los campos");
    return;
  }

  const { error } = await supabase.from("groups").insert([{
    name: name,
    link: link,
    category: category,
    owner: user.id,
    verified: false
  }]);

  if (error) {
    alert(error.message);
  } else {
    alert("Grupo enviado. Pendiente de aprobación.");
    document.getElementById("name").value = "";
    document.getElementById("link").value = "";
    document.getElementById("category").value = "";
  }
}

async function loadGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select("*")
    .eq("verified", true)
    .order("views", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const container = document.getElementById("groups");
  if (!container) return;

  container.innerHTML = "";

  data.forEach(group => {
    container.innerHTML += `
      <div class="card">
        <h3>${group.name}</h3>
        <p>${group.category || ""}</p>
        <a href="${group.link}" target="_blank"
           onclick="addView('${group.id}')">
           Entrar
        </a>
      </div>
    `;
  });
}

/***********************
 * VISITAS (TOP)
 ***********************/
async function addView(groupId) {
  await supabase.rpc("add_view", { gid: groupId });
}

/***********************
 * BUSCADOR
 ***********************/
function searchGroups() {
  const query = document
    .getElementById("search")
    .value
    .toLowerCase();

  document.querySelectorAll(".card").forEach(card => {
    card.style.display = card.innerText
      .toLowerCase()
      .includes(query)
      ? "block"
      : "none";
  });
}

/***********************
 * AUTO LOAD
 ***********************/
document.addEventListener("DOMContentLoaded", () => {
  loadGroups();
});
    
