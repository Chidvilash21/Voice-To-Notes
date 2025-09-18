const express = require("express");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static("public")); // serve your HTML/CSS/JS from /public

// ✅ Setup SQLite DB
const db = new sqlite3.Database("./voiceNotes.db", (err) => {
  if (err) console.error(err.message);
  console.log("✅ Connected to SQLite database");
});

// ✅ Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    file BLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// ✅ Multer setup (store file in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ✅ Upload route
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const { originalname, buffer } = req.file;

  db.run(
    `INSERT INTO notes (filename, file) VALUES (?, ?)`,
    [originalname, buffer],
    function (err) {
      if (err) {
        console.error("DB insert error:", err.message);
        return res.status(500).json({ error: "DB insert failed" });
      }
      res.json({ success: true, id: this.lastID, filename: originalname });
    }
  );
});

// ✅ Route to fetch stored files (optional)
app.get("/notes/:id", (req, res) => {
  db.get(`SELECT * FROM notes WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).send("DB error");
    if (!row) return res.status(404).send("File not found");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${row.filename}`);
    res.send(row.file);
  });
});

// ✅ Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
