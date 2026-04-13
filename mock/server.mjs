import { App } from "@tinyhttp/app";
import { cors } from "@tinyhttp/cors";
import { json } from "milliparsec";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const PORT = Number(process.env.PORT || 4000);
const adapter = new JSONFile("mock/db.json");
const db = new Low(adapter, { users: [], projects: [], tasks: [] });
await db.read();
db.data ||= { users: [], projects: [], tasks: [] };

const app = new App();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(json());
app.options("*", cors());

function nowIso() {
  return new Date().toISOString();
}

function makeToken(userId) {
  return `mock-token-${userId}`;
}

function parseToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token.startsWith("mock-token-")) return null;
  return token.replace("mock-token-", "");
}

function validationError(res, fields) {
  return res.status(400).json({ error: "validation failed", fields });
}

function requireAuth(req, res) {
  const userId = parseToken(req.headers.authorization);
  if (!userId) {
    res.status(401).json({ error: "unauthorized" });
    return null;
  }
  const user = db.data.users.find((u) => u.id === userId);
  if (!user) {
    res.status(401).json({ error: "unauthorized" });
    return null;
  }
  return user;
}

app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body ?? {};
  const fields = {};
  if (!name) fields.name = "is required";
  if (!email) fields.email = "is required";
  if (!password) fields.password = "is required";
  if (Object.keys(fields).length > 0) return validationError(res, fields);

  let user = db.data.users.find((u) => u.email === email);
  if (!user) {
    user = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      created_at: nowIso(),
    };
    db.data.users.push(user);
    await db.write();
  }

  return res.status(201).json({
    token: makeToken(user.id),
    user: { id: user.id, name: user.name, email: user.email },
  });
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  const fields = {};
  if (!email) fields.email = "is required";
  if (!password) fields.password = "is required";
  if (Object.keys(fields).length > 0) return validationError(res, fields);

  let user = db.data.users.find((u) => u.email === email);
  if (!user) {
    user = {
      id: crypto.randomUUID(),
      name: email.split("@")[0] || "User",
      email,
      password,
      created_at: nowIso(),
    };
    db.data.users.push(user);
    await db.write();
  }

  return res.status(200).json({
    token: makeToken(user.id),
    user: { id: user.id, name: user.name, email: user.email },
  });
});

app.get("/projects", (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  const projects = db.data.projects.filter((p) => p.owner_id === user.id);
  return res.status(200).json({ projects });
});

app.post("/projects", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  const { name, description } = req.body ?? {};
  if (!name) return validationError(res, { name: "is required" });

  const project = {
    id: crypto.randomUUID(),
    name,
    description: description ?? null,
    owner_id: user.id,
    created_at: nowIso(),
  };
  db.data.projects.push(project);
  await db.write();
  return res.status(201).json(project);
});

app.get("/projects/:id", (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  const project = db.data.projects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: "not found" });
  if (project.owner_id !== user.id) return res.status(403).json({ error: "forbidden" });

  const tasks = db.data.tasks.filter((t) => t.project_id === project.id);
  return res.status(200).json({ ...project, tasks });
});

app.patch("/projects/:id", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  const project = db.data.projects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: "not found" });
  if (project.owner_id !== user.id) return res.status(403).json({ error: "forbidden" });

  const { name, description } = req.body ?? {};
  if (typeof name === "string") project.name = name;
  if (description !== undefined) project.description = description;
  await db.write();
  return res.status(200).json(project);
});

app.delete("/projects/:id", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  const idx = db.data.projects.findIndex((p) => p.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "not found" });
  if (db.data.projects[idx].owner_id !== user.id) return res.status(403).json({ error: "forbidden" });

  const projectId = db.data.projects[idx].id;
  db.data.projects.splice(idx, 1);
  db.data.tasks = db.data.tasks.filter((task) => task.project_id !== projectId);
  await db.write();
  return res.status(204).send("");
});

app.get("/projects/:id/tasks", (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  const project = db.data.projects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: "not found" });
  if (project.owner_id !== user.id) return res.status(403).json({ error: "forbidden" });

  const { status, assignee } = req.query;
  let tasks = db.data.tasks.filter((t) => t.project_id === project.id);
  if (status) tasks = tasks.filter((t) => t.status === status);
  if (assignee) tasks = tasks.filter((t) => t.assignee_id === assignee);

  return res.status(200).json({ tasks });
});

app.post("/projects/:id/tasks", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  const project = db.data.projects.find((p) => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: "not found" });
  if (project.owner_id !== user.id) return res.status(403).json({ error: "forbidden" });

  const { title, description, priority, due_date } = req.body ?? {};
  if (!title) return validationError(res, { title: "is required" });

  const task = {
    id: crypto.randomUUID(),
    project_id: project.id,
    title,
    description: description ?? null,
    status: "todo",
    priority: priority || "medium",
    assignee_id: user.id,
    due_date: due_date ?? null,
    created_at: nowIso(),
    updated_at: nowIso(),
  };
  db.data.tasks.push(task);
  await db.write();
  return res.status(201).json(task);
});

app.patch("/tasks/:id", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  const task = db.data.tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "not found" });

  const project = db.data.projects.find((p) => p.id === task.project_id);
  if (!project || project.owner_id !== user.id) return res.status(403).json({ error: "forbidden" });

  const fields = ["title", "description", "status", "priority", "assignee_id", "due_date"];
  for (const field of fields) {
    if (req.body?.[field] !== undefined) {
      task[field] = req.body[field];
    }
  }
  task.updated_at = nowIso();
  await db.write();
  return res.status(200).json(task);
});

app.delete("/tasks/:id", async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;

  const taskIndex = db.data.tasks.findIndex((t) => t.id === req.params.id);
  if (taskIndex < 0) return res.status(404).json({ error: "not found" });

  const task = db.data.tasks[taskIndex];
  const project = db.data.projects.find((p) => p.id === task.project_id);
  if (!project || project.owner_id !== user.id) return res.status(403).json({ error: "forbidden" });

  db.data.tasks.splice(taskIndex, 1);
  await db.write();
  return res.status(204).send("");
});

app.use((_req, res) => {
  res.status(404).json({ error: "not found" });
});

app.listen(PORT, () => {
  console.log(`Mock API running on http://localhost:${PORT}`);
});
