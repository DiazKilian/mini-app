let isGenerating = false;

// Usuarios

async function loadUsers() {
  const res = await fetch("/users");
  const users = await res.json();

  const list = document.getElementById("usersList");
  const select = document.getElementById("userSelect");

  list.innerHTML = "";
  select.innerHTML = '<option value="">Selecciona usuario</option>';

  users.forEach((u) => {
    list.innerHTML += `
      <li>
        <div id="user-view-${u.id}">
          <b>${u.name}</b><br>
          Edad: ${u.age || "-"}<br>
          Tel: ${u.phone || "-"}<br>

          <button onclick="showEditUser('${u.id}')">✏️</button>
          <button onclick="deleteUser('${u.id}')">X</button>
        </div>

        <div id="user-edit-${u.id}" class="hidden">
          <input id="edit-name-${u.id}" value="${u.name}">
          <input id="edit-age-${u.id}" value="${u.age || ""}">
          <input id="edit-phone-${u.id}" value="${u.phone || ""}">

          <button onclick="saveUser('${u.id}')">Guardar</button>
          <button onclick="cancelUser('${u.id}')">Cancelar</button>
        </div>
      </li>
    `;

    select.innerHTML += `<option value="${u.id}">${u.name}</option>`;
  });
}

async function createUser() {
  const name = document.getElementById("userName").value;
  const age = document.getElementById("userAge").value;
  const phone = document.getElementById("userPhone").value;

  if (!name) return;

  await fetch("/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, age, phone }),
  });

  document.getElementById("userName").value = "";
  document.getElementById("userAge").value = "";
  document.getElementById("userPhone").value = "";

  loadUsers();
}

async function deleteUser(id) {
  await fetch(`/users/${id}`, { method: "DELETE" });
  loadUsers();
  loadMissions();
}

function showEditUser(id) {
  document.getElementById(`user-view-${id}`).classList.add("hidden");
  document.getElementById(`user-edit-${id}`).classList.remove("hidden");
}

function cancelUser(id) {
  document.getElementById(`user-view-${id}`).classList.remove("hidden");
  document.getElementById(`user-edit-${id}`).classList.add("hidden");
}

async function saveUser(id) {
  const name = document.getElementById(`edit-name-${id}`).value;
  const age = document.getElementById(`edit-age-${id}`).value;
  const phone = document.getElementById(`edit-phone-${id}`).value;

  await fetch(`/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, age, phone }),
  });

  loadUsers();
  loadMissions();
}

// Misiones

async function loadMissions() {
  const resM = await fetch("/missions");
  const missions = await resM.json();

  const resU = await fetch("/users");
  const users = await resU.json();

  const list = document.getElementById("missionsList");
  list.innerHTML = "";

  missions.forEach((m) => {
    const user = users.find((u) => u.id === m.userId);

    list.innerHTML += `
      <li>
        <b>${m.title}</b> 
        <span style="color:gray;">(${user ? user.name : "Sin usuario"})</span>

        <br>
        <span id="desc-${m.id}">${m.description}</span>

        <div id="ai-${m.id}" class="ai-box hidden"></div>

        <br>

        <button onclick="deleteMission('${m.id}')">Eliminar</button>
        <button onclick="showEdit('${m.id}')">Editar</button>
        <button onclick="generateAI('${m.id}')">IA ✨</button>
      </li>
    `;
  });
}

async function createMission() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const userId = document.getElementById("userSelect").value;

  if (!title || !description || !userId) return;

  await fetch("/missions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, userId }),
  });

  document.getElementById("title").value = "";
  document.getElementById("description").value = "";

  loadMissions();
}

async function showEdit(id) {
  const container = document.getElementById(`ai-${id}`);

  const users = await (await fetch("/users")).json();
  const missions = await (await fetch("/missions")).json();
  const mission = missions.find((m) => m.id === id);

  container.classList.remove("hidden");

  container.innerHTML = `
    <input id="edit-title-${id}" value="${mission.title}">
    <textarea id="edit-desc-${id}">${mission.description}</textarea>

    <select id="edit-user-${id}">
      ${users
        .map(
          (u) => `
        <option value="${u.id}" ${u.id === mission.userId ? "selected" : ""}>
          ${u.name}
        </option>
      `,
        )
        .join("")}
    </select>

    <button onclick="saveEdit('${id}')">Guardar</button>
    <button onclick="cancelEdit('${id}')">Cancelar</button>
  `;
}

async function saveEdit(id) {
  const title = document.getElementById(`edit-title-${id}`).value;
  const description = document.getElementById(`edit-desc-${id}`).value;
  const userId = document.getElementById(`edit-user-${id}`).value;

  if (!title || !description || !userId) {
    alert("Faltan datos");
    return;
  }

  await fetch(`/missions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, userId }),
  });

  loadMissions();
}

function cancelEdit(id) {
  document.getElementById(`ai-${id}`).classList.add("hidden");
}

async function deleteMission(id) {
  await fetch(`/missions/${id}`, { method: "DELETE" });
  loadMissions();
}

// Generaccion IA

async function generateAI(id) {
  if (isGenerating) return;
  isGenerating = true;

  const container = document.getElementById(`ai-${id}`);
  const description = document.getElementById(`desc-${id}`).innerText;

  container.classList.remove("hidden");
  container.innerHTML = "⏳ Generando...";

  try {
    const res = await fetch("/ai/improve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });

    const data = await res.json();
    let text = data.improved || "Error";

    text = text.replace(/\n/g, " ").replace(/'/g, "").replace(/"/g, "");

    container.innerHTML = `
      <p>${text}</p>
      <button onclick="acceptAI('${id}', '${text}')">Aceptar</button>
      <button onclick="generateAI('${id}')">Regenerar</button>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = "❌ Error IA";
  } finally {
    isGenerating = false;
  }
}

async function acceptAI(id, newText) {
  const res = await fetch("/missions");
  const missions = await res.json();
  const mission = missions.find((m) => m.id === id);

  await fetch(`/missions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: mission.title,
      description: newText,
      userId: mission.userId,
    }),
  });

  loadMissions();
}

loadUsers();
loadMissions();
