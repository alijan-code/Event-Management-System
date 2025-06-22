import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// API routes for demonstration
app.get('/api/events', (req, res) => {
  res.json([
    { id: 1, name: 'Wedding', date: '2025-06-15' },
    { id: 2, name: 'Corporate Conference', date: '2025-07-10' },
    { id: 3, name: 'Music Festival', date: '2025-08-22' }
  ]);
});

app.post('/api/bookings', (req, res) => {
  // In a real app, this would save to a database
  console.log('Booking received:', req.body);
  res.status(200).json({ success: true });
});

app.post('/api/admin/login', (req, res) => {
  // Demo login - in production, use proper authentication
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    res.json({ token: 'demo-token-1234567890' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// For all other routes, serve the index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
