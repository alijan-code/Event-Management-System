import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { data } from './data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple authentication middleware for API routes
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization;
  // In a real app, verify JWT token here
  if (token === 'Bearer demo-token-1234567890') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Handle HTML routes - Support both with and without .html extension
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// About routes
app.get('/about', (req, res) => {
  res.sendFile(join(__dirname, 'about.html'));
});
app.get('/about.html', (req, res) => {
  res.sendFile(join(__dirname, 'about.html'));
});

// Services routes
app.get('/services', (req, res) => {
  res.sendFile(join(__dirname, 'services.html'));
});
app.get('/services.html', (req, res) => {
  res.sendFile(join(__dirname, 'services.html'));
});

// Contact routes
app.get('/contact', (req, res) => {
  res.sendFile(join(__dirname, 'contact.html'));
});
app.get('/contact.html', (req, res) => {
  res.sendFile(join(__dirname, 'contact.html'));
});

// Booking routes
app.get('/booking', (req, res) => {
  res.sendFile(join(__dirname, 'booking.html'));
});
app.get('/booking.html', (req, res) => {
  res.sendFile(join(__dirname, 'booking.html'));
});

// Admin routes
app.get('/admin/login', (req, res) => {
  res.sendFile(join(__dirname, 'admin-login.html'));
});
app.get('/admin-login.html', (req, res) => {
  res.sendFile(join(__dirname, 'admin-login.html'));
});

app.get('/admin/dashboard', (req, res) => {
  res.sendFile(join(__dirname, 'admin-dashboard.html'));
});
app.get('/admin-dashboard.html', (req, res) => {
  res.sendFile(join(__dirname, 'admin-dashboard.html'));
});

// API Routes

// Bookings
app.get('/api/bookings', authenticateAdmin, (req, res) => {
  res.json(data.bookings);
});

app.post('/api/bookings', (req, res) => {
  const newBooking = data.addBooking(req.body);
  console.log('Booking received:', newBooking);
  res.status(201).json({ success: true, booking: newBooking });
});

app.put('/api/bookings/:id/status', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const updatedBooking = data.updateBookingStatus(id, status);
  if (updatedBooking) {
    res.json({ success: true, booking: updatedBooking });
  } else {
    res.status(404).json({ error: 'Booking not found' });
  }
});

// Messages
app.get('/api/messages', authenticateAdmin, (req, res) => {
  res.json(data.messages);
});

app.post('/api/messages', (req, res) => {
  const newMessage = data.addMessage(req.body);
  res.status(201).json({ success: true, message: newMessage });
});

app.put('/api/messages/:id/read', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const updatedMessage = data.markMessageAsRead(id);
  
  if (updatedMessage) {
    res.json({ success: true, message: updatedMessage });
  } else {
    res.status(404).json({ error: 'Message not found' });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', authenticateAdmin, (req, res) => {
  const stats = {
    totalBookings: data.bookings.length,
    pendingBookings: data.bookings.filter(b => b.status === 'pending').length,
    approvedBookings: data.bookings.filter(b => b.status === 'approved').length,
    rejectedBookings: data.bookings.filter(b => b.status === 'rejected').length,
    unreadMessages: data.messages.filter(m => !m.read).length,
    totalMessages: data.messages.length
  };
  
  res.json(stats);
});

// Authentication
app.post('/api/admin/login', (req, res) => {
  console.log('Login request received:', req.body);
  
  const { username, password } = req.body;
  
  // Log all users for debugging
  console.log('Available users:', data.users);
  
  // Find user with exact match
  const user = data.users.find(u => u.username === username && u.password === password);
  
  console.log('User found:', user ? 'Yes' : 'No');
  
  if (user) {
    const responseData = { 
      success: true, 
      token: 'demo-token-1234567890',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
    
    console.log('Sending successful response:', responseData);
    res.json(responseData);
  } else {
    console.log('Authentication failed for:', username);
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
