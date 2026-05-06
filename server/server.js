const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/events", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM events");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/events/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM events WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Event not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/events/:id/stats", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM registrations WHERE event_id = ?
       GROUP BY DATE(created_at) ORDER BY date`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/news", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM news");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/registrations", async (req, res) => {
  try {
    const { event_id, firstName, lastName, email, telegram } = req.body;
    await pool.query(
      "INSERT INTO registrations (event_id, first_name, last_name, email, telegram) VALUES (?, ?, ?, ?, ?)",
      [event_id, firstName, lastName, email, telegram]
    );
    res.json({ message: "Registered to event" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/auth/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ error: "Заповніть всі поля" });
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(400).json({ error: "Користувач вже існує" });
    await pool.query("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", [email, password, role]);
    res.json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );
    if (!users.length) return res.status(401).json({ error: "Невірні дані" });
    res.json({ message: "Login success", user: users[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/stats", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, COUNT(r.id) as registrations
       FROM events e LEFT JOIN registrations r ON e.id = r.event_id
       GROUP BY e.id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/events/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM events WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/admin/news", async (req, res) => {
  try {
    const { title, content, date } = req.body;
    if (!title || !content || !date) return res.status(400).json({ error: "Заповніть всі поля" });
    await pool.query("INSERT INTO news (title, content, date) VALUES (?, ?, ?)", [title, content, date]);
    res.json({ message: "News created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/news", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM news ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/admin/news/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM news WHERE id = ?", [req.params.id]);
    res.json({ message: "News deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/admin/events/:id", async (req, res) => {
  try {
    const { title, description, location, date, category, image } = req.body;
    await pool.query(
      "UPDATE events SET title=?, description=?, location=?, date=?, category=?, image=? WHERE id=?",
      [title, description, location, date, category, image, req.params.id]
    );
    res.json({ message: "Event updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/admin/events", async (req, res) => {
  try {
    const { title, description, location, date, category, image, user_id } = req.body;
    await pool.query(
      "INSERT INTO events (title, description, location, date, category, image, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, description, location, date, category, image, user_id]
    );
    res.json({ message: "Event created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/organizer/events/:userId", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, COUNT(r.id) as registrations
       FROM events e LEFT JOIN registrations r ON e.id = r.event_id
       WHERE e.user_id = ? GROUP BY e.id`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/events/:id/registrations", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT first_name, last_name, email, telegram FROM registrations WHERE event_id = ?",
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// React static
app.use(express.static(path.join(__dirname, "../frontend/build")));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
