// Simple in-memory data store for the application
export const data = {
  bookings: [
    {
      id: 1,
      name: "John Smith",
      email: "john@example.com",
      phone: "555-123-4567",
      eventType: "Wedding",
      date: "2025-06-15",
      attendees: 150,
      details: "Looking for a complete wedding package including venue decoration, catering, and photography.",
      status: "pending",
      budget: "$10,000 - $25,000",
      createdAt: "2025-05-15"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "555-987-6543",
      eventType: "Conference",
      date: "2025-07-10",
      attendees: 200,
      details: "Tech conference with keynote speakers, breakout sessions, and networking opportunities.",
      status: "pending",
      budget: "$25,000 - $50,000",
      createdAt: "2025-05-16"
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "michael@example.com",
      phone: "555-456-7890",
      eventType: "Concert",
      date: "2025-08-22",
      attendees: 500,
      details: "Local band performance with sound system, lighting, and stage setup requirements.",
      status: "approved",
      budget: "$5,000 - $10,000",
      createdAt: "2025-05-10"
    }
  ],
  
  messages: [
    {
      id: 1,
      name: "David Wilson",
      email: "david@example.com",
      subject: "Question about corporate events",
      message: "I'm interested in organizing a corporate retreat for my team of 30 people. Do you offer packages specifically for team-building activities?",
      date: "2025-05-18",
      read: false
    },
    {
      id: 2,
      name: "Emily Rodriguez",
      email: "emily@example.com",
      subject: "Wedding consultation",
      message: "My fiancé and I are planning our wedding for next summer. We'd like to schedule a consultation to discuss your wedding packages and services.",
      date: "2025-05-17",
      read: true
    },
    {
      id: 3,
      name: "Robert Chen",
      email: "robert@example.com",
      subject: "Venue recommendations",
      message: "I'm organizing a charity gala and looking for venue recommendations that can accommodate 200 guests. Do you have preferred venues you work with?",
      date: "2025-05-15",
      read: true
    }
  ],
  
  users: [
    {
      id: 1,
      name: "Admin User",
      email: "admin@eventify.com",
      role: "admin",
      username: "admin",
      password: "password" // In a real app, this would be hashed
    }
  ],
  
  // Methods to manipulate data
  addBooking(booking) {
    const newBooking = {
      ...booking,
      id: this.bookings.length + 1,
      status: "pending",
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.bookings.push(newBooking);
    return newBooking;
  },
  
  updateBookingStatus(id, status) {
    const booking = this.bookings.find(b => b.id === parseInt(id));
    if (booking) {
      booking.status = status;
      return booking;
    }
    return null;
  },
  
  addMessage(message) {
    const newMessage = {
      ...message,
      id: this.messages.length + 1,
      date: new Date().toISOString().split('T')[0],
      read: false
    };
    this.messages.push(newMessage);
    return newMessage;
  },
  
  markMessageAsRead(id) {
    const message = this.messages.find(m => m.id === parseInt(id));
    if (message) {
      message.read = true;
      return message;
    }
    return null;
  }
};
