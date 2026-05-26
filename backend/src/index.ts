import cors from "cors";
import express from "express";

type Post = {
  id: number;
  title: string;
  body: string;
  userId: number;
};

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Seed data — resets when server restarts
let posts: Post[] = [
  { id: 1, title: "First post", body: "Hello world", userId: 1 },
  { id: 2, title: "Second post", body: "Another line", userId: 1 },
];

let nextId = 3;

function findIndexById(id: number) {
  return posts.findIndex((p) => p.id === id);
}

// GET all posts
app.get("/posts", (_req, res) => {
  res.status(200).json(posts);
});

// GET one post
app.get("/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "id must be a number" });
    return;
  }
  const post = posts.find((p) => p.id === id);
  if (!post) {
    res.status(404).json({ error: "post not found" });
    return;
  }
  res.status(200).json(post);
});

// POST create
app.post("/posts", (req, res) => {
  const { title, body, userId } = req.body ?? {};
  if (title === undefined || body === undefined || userId === undefined) {
    res.status(400).json({ error: "title, body, and userId are required" });
    return;
  }
  const newPost: Post = {
    id: nextId++,
    title: String(title),
    body: String(body),
    userId: Number(userId),
  };
  posts.push(newPost);
  res.status(201).json(newPost);
});

// PUT replace (or create with that id if missing)
app.put("/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "id must be a number" });
    return;
  }
  const { title, body, userId } = req.body ?? {};
  if (title === undefined || body === undefined || userId === undefined) {
    res.status(400).json({ error: "title, body, and userId are required" });
    return;
  }

  const idx = findIndexById(id);
  const updated: Post = {
    id,
    title: String(title),
    body: String(body),
    userId: Number(userId),
  };

  if (idx === -1) {
    posts.push(updated);
    if (id >= nextId) nextId = id + 1;
    res.status(201).json(updated);
    return;
  }

  posts[idx] = updated;
  res.status(200).json(updated);
});

// PATCH partial update
app.patch("/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "id must be a number" });
    return;
  }
  const idx = findIndexById(id);
  if (idx === -1) {
    res.status(404).json({ error: "post not found" });
    return;
  }

  const patch = req.body ?? {};
  const current = posts[idx];
  const merged: Post = {
    id: current.id,
    title: patch.title !== undefined ? String(patch.title) : current.title,
    body: patch.body !== undefined ? String(patch.body) : current.body,
    userId:
      patch.userId !== undefined ? Number(patch.userId) : current.userId,
  };
  posts[idx] = merged;
  res.status(200).json(merged);
});

// DELETE
app.delete("/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "id must be a number" });
    return;
  }
  const idx = findIndexById(id);
  if (idx === -1) {
    res.status(404).json({ error: "post not found" });
    return;
  }
  const [removed] = posts.splice(idx, 1);
  res.status(200).json(removed);
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
