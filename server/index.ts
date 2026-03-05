import express from 'express';
import SQLite from 'better-sqlite3';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Initialize database
// Using ':memory:' for a transient database, or 'chat.db' for persistent storage
const db = new SQLite('chat.db', { verbose: console.log });

app.use(cors());
app.use(express.json());

// Create messages table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// API to get all messages
app.get('/api/messages', (req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM messages ORDER BY timestamp ASC').all();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// API to post a new message
app.post('/api/messages', (req, res) => {
  const { user, content } = req.body;
  if (!user || !content) {
    return res.status(400).json({ error: 'User and content are required' });
  }

  try {
    const stmt = db.prepare('INSERT INTO messages (user, content) VALUES (?, ?)');
    const info = stmt.run(user, content);
    // Fetch the newly inserted message to include its ID and actual timestamp
    const newMessage = db.prepare('SELECT * FROM messages WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error inserting message:', error);
    res.status(500).json({ error: 'Failed to post message' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Closing database connection...');
  db.close();
  process.exit(0);
});
