const SUPABASE_URL = "https://vxnfbrgafuwtoltxuwtj.supabase.co";
const SUPABASE_KEY = "sb_publishable_nGWxhy5B8Lo1EObzK72cvg_TksWevuo";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function register() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!email || !password) return alert("Completa email y contraseña");
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

async function logout() { await supabase.auth.signOut(); location.href = "index.html"; }

async function addGroup() {
  const { data } = await supabase.auth.getUser(); 
  const user = data.user;
  if (!user) return alert("Debes iniciar sesión");

  const name = gid("name").value.trim(); 
  const link = gid("link").value.trim();
  const category = gid("category").value.trim();
  if (!name || !link) return alert("Completa los campos obligatorios");

  const { data: inserted, error } = await supabase.from("groups")
    .insert([{name, link, category, owner: user.id, verified: false}]).select();
  if (error) return alert(error.message);

  const receipt = inserted[0].id;
  alert("✅ Grupo enviado\n🧾 Recibo: "+receipt+"\nEstado: ⏳ Pendiente");
  gid("name").value=""; gid("link").value=""; gid("category").value="";
  loadMyGroups();
}

async function loadMyGroups() {
  const { data } = await supabase.auth.getUser(); const user = data.user; if (!user) return;
  const { data: groups } = await supabase.from("groups").select("*").eq("owner", user.id).order("created_at",{ascending:false});
  const box = document.getElementById("myGroups"); if(!box) return; box.innerHTML="";
  groups.forEach(g=>{
    box.innerHTML+=`<div class="card">
      <h3>${g.name}</h3>
      <p>${g.category||"-"}</p>
      <p class="${g.verified?'status-ok':'status-wait'}">${g.verified?"✅ Aprobado":"⏳ Pendiente"}</p>
      <small>🧾 Recibo: ${g.id}</small>
    </div>`;
  });
}

async function loadGroups() {
  const { data } = await supabase.from("groups").select("*").eq("verified",true).order("views",{ascending:false});
  const container = document.getElementById("groups"); if(!container) return; container.innerHTML="";
  data.forEach(g=>{
    container.innerHTML+=`<div class="card">
      <h3>${g.name}</h3>
      <p>${g.category||""}</p>
      <a href="${g.link}" target="_blank" onclick="addView('${g.id}')">Entrar</a>
    </div>`;
  });
}

async function addView(id){ await supabase.rpc("add_view",{gid:id}); }

function searchGroups(){ const q=gid("search").value.toLowerCase(); document.querySelectorAll(".card").forEach(c=>c.style.display=c.innerText.toLowerCase().includes(q)?"block":"none"); }
function gid(id){return document.getElementById(id);}

document.addEventListener("DOMContentLoaded",()=>{ loadGroups(); loadMyGroups(); });
