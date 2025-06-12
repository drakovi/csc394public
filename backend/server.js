const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { OpenAI } = require('openai');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// --- Register ---
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  const password_hash = hashPassword(password);
  const sql = 'INSERT INTO users (username, password_hash) VALUES (?, ?)';
  db.query(sql, [username, password_hash], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Username already exists' });
      return res.status(500).json({ message: 'Server error' });
    }
    res.json({ message: 'User registered successfully' });
  });
});

// --- Login ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const password_hash = hashPassword(password);
  const sql = 'SELECT * FROM users WHERE username = ? AND password_hash = ?';
  db.query(sql, [username, password_hash], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ message: 'Login successful', username });
  });
});

// --- Combined Search with OpenAI & History ---
app.post('/api/combined-search', async (req, res) => {
  const { query, username } = req.body;

  // Save to search history
  if (username) {
    db.query('INSERT INTO search_history (username, query) VALUES (?, ?)', [username, query]);
  }

  try {
    const prompt = `List the top 3 U.S. cybersecurity or data privacy laws related to this question: "${query}". For each law, provide:
- title
- one-sentence description
- a direct source URL
- MLA citation for that source

Respond only in JSON array format. Each law should be a JSON object with keys: title, description, url, citation.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4'
    });

    const content = completion.choices[0].message.content;
    let aiResults = [];
    try {
      aiResults = JSON.parse(content);
    } catch (err) {
      console.error('OpenAI JSON parse error:', err);
      return res.status(500).json({ message: 'Could not parse AI response' });
    }

    // Use keywords from AI result to query DB
    const keywords = aiResults
      .flatMap(law => law.title.split(' ').concat(law.description.split(' ')))
      .map(k => k.replace(/[^a-zA-Z]/g, '').toLowerCase())
      .filter(word => word.length > 3);

    const conditions = keywords.map(k => '(title LIKE ? OR description LIKE ?)').join(' OR ');
    const values = keywords.flatMap(k => [`%${k}%`, `%${k}%`]);

    const sql = `
  SELECT * FROM us_cybersecurity_laws 
  WHERE ${conditions} 
  LIMIT 10
`;
db.query(sql, values, (err, dbResults) => {
  if (err) return res.status(500).json({ message: 'SQL error' });

  // Rank and limit top 3 by keyword hits
  const scored = dbResults.map(row => {
    const text = `${row.title} ${row.description}`.toLowerCase();
    const score = keywords.reduce((acc, word) => acc + (text.includes(word) ? 1 : 0), 0);
    return { ...row, score };
  });

  const topDbResults = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  res.json({ aiResults: aiResults.slice(0, 3), dbResults: topDbResults });
});

  } catch (err) {
    console.error('Combined search error:', err);
    res.status(500).json({ message: 'Failed to fetch OpenAI results' });
  }
});

// --- Search History (last 10) ---
app.get('/api/search-history/:username', (req, res) => {
  const sql = `
    SELECT query, timestamp
    FROM search_history
    WHERE username = ?
    ORDER BY timestamp DESC
    LIMIT 10
  `;
  db.query(sql, [req.params.username], (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch history' });
    res.json(results);
  });
});

// --- Get Bookmarks ---
app.get('/api/bookmarks/:username', (req, res) => {
  const sql = 'SELECT citation FROM bookmarks WHERE username = ?';
  db.query(sql, [req.params.username], (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch bookmarks' });
    res.json(results.map(row => row.citation));
  });
});

// --- Add Bookmark (max 5) ---
app.post('/api/bookmarks', (req, res) => {
  const { username, citation } = req.body;
  const countQuery = 'SELECT COUNT(*) AS count FROM bookmarks WHERE username = ?';

  db.query(countQuery, [username], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error counting bookmarks' });
    if (results[0].count >= 5) {
      return res.status(400).json({ message: 'Maximum 5 bookmarks allowed' });
    }

    const insertQuery = 'INSERT INTO bookmarks (username, citation) VALUES (?, ?)';
    db.query(insertQuery, [username, citation], (err) => {
      if (err) return res.status(500).json({ message: 'Failed to save bookmark' });
      res.json({ message: 'Bookmark saved' });
    });
  });
});

// --- Delete Bookmark ---
app.delete('/api/bookmarks', (req, res) => {
  const { username, citation } = req.body;
  const sql = 'DELETE FROM bookmarks WHERE username = ? AND citation = ?';
  db.query(sql, [username, citation], (err) => {
    if (err) return res.status(500).json({ message: 'Failed to delete bookmark' });
    res.json({ message: 'Bookmark removed' });
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

