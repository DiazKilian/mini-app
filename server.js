import express from "express";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const DB_PATH = "./data/db.json";

const readDB = async () => await fs.readJson(DB_PATH);
const writeDB = async (data) =>
  await fs.writeJson(DB_PATH, data, { spaces: 2 });

//////////////////////////
// USERS
//////////////////////////

app.get("/users", async (req, res) => {
  const db = await readDB();
  res.json(db.users);
});

app.post("/users", async (req, res) => {
  const { name, age, phone } = req.body;

  if (!name) return res.status(400).json({ error: "Nombre requerido" });

  const db = await readDB();

  const newUser = {
    id: uuidv4(),
    name,
    age,
    phone,
  };

  db.users.push(newUser);
  await writeDB(db);

  res.json(newUser);
});

app.put("/users/:id", async (req, res) => {
  const db = await readDB();

  const user = db.users.find((u) => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  user.name = req.body.name;
  user.age = req.body.age;
  user.phone = req.body.phone;

  await writeDB(db);
  res.json(user);
});

app.delete("/users/:id", async (req, res) => {
  const db = await readDB();

  db.users = db.users.filter((u) => u.id !== req.params.id);
  db.missions = db.missions.filter((m) => m.userId !== req.params.id);

  await writeDB(db);
  res.json({ success: true });
});

//////////////////////////
// MISSIONS
//////////////////////////

app.get("/missions", async (req, res) => {
  const db = await readDB();
  res.json(db.missions);
});

app.post("/missions", async (req, res) => {
  const { title, description, userId } = req.body;

  if (!title || !description || !userId) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const db = await readDB();

  const newMission = {
    id: uuidv4(),
    title,
    description,
    userId,
  };

  db.missions.push(newMission);
  await writeDB(db);

  res.json(newMission);
});

app.put("/missions/:id", async (req, res) => {
  const db = await readDB();

  const mission = db.missions.find((m) => m.id === req.params.id);

  if (!mission) {
    return res.status(404).json({ error: "No encontrada" });
  }

  mission.title = req.body.title;
  mission.description = req.body.description;
  mission.userId = req.body.userId;

  await writeDB(db);
  res.json(mission);
});

app.delete("/missions/:id", async (req, res) => {
  const db = await readDB();

  db.missions = db.missions.filter((m) => m.id !== req.params.id);

  await writeDB(db);
  res.json({ success: true });
});

//////////////////////////
// IA (ARREGLADA)
//////////////////////////

app.post("/ai/improve", async (req, res) => {
  const { description } = req.body;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Mejora este texto, no tan largo, algo natural y que ayude a mejorar esta descripción:

${description}`,
                },
              ],
            },
          ],
        }),
      },
    );

    const data = await response.json();

    console.log("IA RAW:", JSON.stringify(data, null, 2)); // 🔥 DEBUG

    let improved = "";

    // 🔥 MANEJO SEGURO
    if (data.candidates && data.candidates.length > 0) {
      const parts = data.candidates[0].content.parts;
      if (parts && parts.length > 0) {
        improved = parts[0].text;
      }
    }

    if (!improved) {
      improved = "❌ No se pudo generar texto";
    }

    // 🔥 limpieza
    improved = improved.replace(/\n/g, " ").replace(/["*]/g, "").trim();

    res.json({ improved });
  } catch (error) {
    console.error("ERROR IA:", error);
    res.json({ improved: "❌ Error IA servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
