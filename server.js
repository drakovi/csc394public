const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Hash password using SHA-256
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Register
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  const password_hash = hashPassword(password);

  const sql = 'INSERT INTO users (username, password_hash) VALUES (?, ?)';
  db.query(sql, [username, password_hash], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Username already exists' });
      }
      return res.status(500).json({ message: 'Server error' });
    }
    res.json({ message: 'User registered successfully' });
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const password_hash = hashPassword(password);

  const sql = 'SELECT * FROM users WHERE username = ? AND password_hash = ?';
  db.query(sql, [username, password_hash], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', username });
  });
});

// Law Search
app.get('/api/laws', (req, res) => {
  const { query, filter } = req.query;

  let sql = 'SELECT * FROM us_cybersecurity_laws WHERE 1=1';
  const values = [];

  if (query) {
    sql += ' AND (title LIKE ? OR description LIKE ?)';
    values.push(`%${query}%`, `%${query}%`);
  }

  if (filter && filter !== 'All') {
    sql += ' AND category = ?';
    values.push(filter);
  }

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Error fetching laws:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(results);
  });
});

// MLA Citation
app.get('/api/laws/:id/citation', (req, res) => {
  const lawId = req.params.id;

  const sql = 'SELECT title, citation, url FROM us_cybersecurity_laws WHERE id = ?';
  db.query(sql, [lawId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: 'Law not found' });
    }

    const law = results[0];

    // MLA-style citation: "Title." Citation. URL.
    const mla = `"${law.title}." ${law.citation}. ${law.url}`;
    res.json({ citation: mla });
  });
});

// Delete Law by Title
app.delete('/api/laws/title/:title', (req, res) => {
  const { title } = req.params;
  const sql = 'DELETE FROM us_cybersecurity_laws WHERE title = ?';
  db.query(sql, [title], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Law not found' });
    res.json({ message: 'Law deleted successfully' });
  });
});

// Delete User
app.delete('/api/users/:username', (req, res) => {
  const { username } = req.params;
  if (username === 'admin') return res.status(400).json({ message: 'Cannot delete default admin user' });

  const sql = 'DELETE FROM users WHERE username = ?';
  db.query(sql, [username], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json({ message: 'User deleted successfully' });
  });
});

// Add Law
app.post('/api/laws', (req, res) => {
  const { title, description, citation, url, category } = req.body;
  const sql = `
    INSERT INTO us_cybersecurity_laws (title, description, citation, url, category)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [title, description, citation, url, category], (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json({ message: 'Law added successfully' });
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));