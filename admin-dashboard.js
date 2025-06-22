// Global variables
let currentBookingId = null;
let currentMessageId = null;
let bookingsData = [];
let messagesData = [];
let pollingInterval = null;
let lastBookingCount = 0;
let lastMessageCount = 0;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('admin_token');
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
  
  if (!token) {
    // Not authenticated, show login required message
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('login-required').classList.remove('hidden');
  } else {
    // Update admin name in header
    if (user.name) {
      document.getElementById('admin-name').textContent = user.name;
    }
    
    // Initialize dashboard
    document.getElementById('dashboard-content').classList.remove('hidden');
    initializeDashboard();
  }
});

// Initialize dashboard data and event listeners
async function initializeDashboard() {
  try {
    // Load dashboard stats
    await loadDashboardStats();
    
    // Load recent bookings
    await loadRecentBookings();
    
    // Load recent messages
    await loadRecentMessages();
    
    // Setup navigation
    setupNavigation();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start polling for new data
    startPolling();
    
    // Hide loading screen
    document.getElementById('loading').classList.add('hidden');
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    alert('Error loading dashboard data. Please try again.');
  }
}

// Setup navigation between sections
function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all links
      navLinks.forEach(l => {
        l.classList.remove('bg-blue-700');
        l.classList.add('hover:bg-blue-700');
      });
      
      // Add active class to clicked link
      this.classList.add('bg-blue-700');
      this.classList.remove('hover:bg-blue-700');
      
      // Hide all sections
      document.querySelectorAll('.section-content').forEach(section => {
        section.classList.add('hidden');
      });
      
      // Show the target section
      const targetSection = this.getAttribute('data-section');
      document.getElementById(targetSection).classList.remove('hidden');
      
      // Load data for the section if needed
      if (targetSection === 'bookings-section') {
        loadAllBookings();
      } else if (targetSection === 'messages-section') {
        loadAllMessages();
      }
    });
  });
  
  // Setup View All buttons
  document.querySelectorAll('.view-all-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const targetSection = this.getAttribute('data-section');
      
      // Trigger click on the corresponding nav link
      document.querySelector(`.nav-link[data-section="${targetSection}"]`).click();
    });
  });
  
  // Setup logout button
  document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    stopPolling(); // Stop polling when logging out
    window.location.href = '/admin-login.html';
  });
}

// Setup event listeners for interactive elements
function setupEventListeners() {
  // Booking filter
  document.getElementById('booking-filter').addEventListener('change', function() {
    filterBookings(this.value);
  });
  
  // Message filter
  document.getElementById('message-filter').addEventListener('change', function() {
    filterMessages(this.value);
  });
  
  // Refresh buttons
  document.getElementById('refresh-bookings').addEventListener('click', loadAllBookings);
  document.getElementById('refresh-messages').addEventListener('click', loadAllMessages);
  
  // Modal close buttons
  document.getElementById('close-booking-modal').addEventListener('click', closeBookingModal);
  document.getElementById('close-booking-btn').addEventListener('click', closeBookingModal);
  document.getElementById('close-message-modal').addEventListener('click', closeMessageModal);
  document.getElementById('close-message-btn').addEventListener('click', closeMessageModal);
  
  // Booking action buttons
  document.getElementById('approve-booking-btn').addEventListener('click', function() {
    updateBookingStatus(currentBookingId, 'approved');
  });
  
  document.getElementById('reject-booking-btn').addEventListener('click', function() {
    updateBookingStatus(currentBookingId, 'rejected');
  });
}

// Load dashboard stats
async function loadDashboardStats() {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await fetch('/api/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load dashboard stats');
    }
    
    const stats = await response.json();
    
    // Update stats on the dashboard
    document.getElementById('total-bookings').textContent = stats.totalBookings;
    document.getElementById('pending-bookings').textContent = stats.pendingBookings;
    document.getElementById('unread-messages').textContent = stats.unreadMessages;
    
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
  }
}

// Load recent bookings for dashboard
async function loadRecentBookings() {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await fetch('/api/bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load bookings');
    }
    
    bookingsData = await response.json();
    
    // Sort by date (newest first) and take only the first 3
    const recentBookings = [...bookingsData]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
    
    // Update the recent bookings table
    const tableBody = document.getElementById('recent-bookings-table');
    
    if (recentBookings.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-4 text-center text-gray-500">No bookings found</td>
        </tr>
      `;
      return;
    }
    
    tableBody.innerHTML = recentBookings.map(booking => `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">${booking.name}</div>
          <div class="text-sm text-gray-500">${booking.email}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.eventType}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.date}</td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}">
            ${capitalizeFirstLetter(booking.status)}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          ${getBookingActions(booking)}
        </td>
      </tr>
    `).join('');
    
    // Add event listeners to the action buttons
    addBookingActionListeners();
    
  } catch (error) {
    console.error('Error loading recent bookings:', error);
    document.getElementById('recent-bookings-table').innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-4 text-center text-red-500">Error loading bookings</td>
      </tr>
    `;
  }
}

// Load recent messages for dashboard
async function loadRecentMessages() {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await fetch('/api/messages', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load messages');
    }
    
    messagesData = await response.json();
    
    // Sort by date (newest first) and take only the first 3
    const recentMessages = [...messagesData]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
    
    // Update the recent messages section
    const messagesContainer = document.getElementById('recent-messages');
    
    if (recentMessages.length === 0) {
      messagesContainer.innerHTML = `<p class="text-center text-gray-500">No messages found</p>`;
      return;
    }
    
    messagesContainer.innerHTML = recentMessages.map(message => `
      <div class="bg-gray-50 p-4 rounded-lg ${!message.read ? 'border-l-4 border-blue-500' : ''}">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-medium ${!message.read ? 'text-blue-600' : 'text-gray-900'}">${message.subject}</h3>
            <p class="text-sm text-gray-500 mt-1">From: ${message.name} (${message.email})</p>
          </div>
          <span class="text-xs text-gray-500">${message.date}</span>
        </div>
        <p class="text-gray-700 mt-2 line-clamp-2">${message.message.substring(0, 100)}${message.message.length > 100 ? '...' : ''}</p>
        <button class="view-message-btn text-blue-600 text-sm mt-2" data-id="${message.id}">View Message</button>
      </div>
    `).join('');
    
    // Add event listeners to the view message buttons
    addMessageViewListeners();
    
  } catch (error) {
    console.error('Error loading recent messages:', error);
    document.getElementById('recent-messages').innerHTML = `<p class="text-center text-red-500">Error loading messages</p>`;
  }
}

// Load all bookings for the bookings section
async function loadAllBookings() {
  try {
    // If we already have the data, no need to fetch again
    if (bookingsData.length === 0) {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load bookings');
      }
      
      bookingsData = await response.json();
    }
    
    // Sort by date (newest first)
    const sortedBookings = [...bookingsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Update the all bookings table
    renderBookingsTable(sortedBookings);
    
  } catch (error) {
    console.error('Error loading all bookings:', error);
    document.getElementById('all-bookings-table').innerHTML = `
      <tr>
        <td colspan="8" class="px-6 py-4 text-center text-red-500">Error loading bookings</td>
      </tr>
    `;
  }
}

// Render the bookings table with the given data
function renderBookingsTable(bookings) {
  const tableBody = document.getElementById('all-bookings-table');
  
  if (bookings.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="px-6 py-4 text-center text-gray-500">No bookings found</td>
      </tr>
    `;
    return;
  }
  
  tableBody.innerHTML = bookings.map(booking => `
    <tr>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#${booking.id}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm font-medium text-gray-900">${booking.name}</div>
        <div class="text-sm text-gray-500">${booking.email}</div>
        <div class="text-sm text-gray-500">${booking.phone || 'N/A'}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.eventType}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.date}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.attendees || 'N/A'}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.budget || 'N/A'}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}">
          ${capitalizeFirstLetter(booking.status)}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
        ${getBookingActions(booking)}
      </td>
    </tr>
  `).join('');
  
  // Add event listeners to the action buttons
  addBookingActionListeners();
}

// Filter bookings based on status
function filterBookings(status) {
  if (status === 'all') {
    renderBookingsTable(bookingsData);
    return;
  }
  
  const filteredBookings = bookingsData.filter(booking => booking.status === status);
  renderBookingsTable(filteredBookings);
}

// Load all messages for the messages section
async function loadAllMessages() {
  try {
    // If we already have the data, no need to fetch again
    if (messagesData.length === 0) {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load messages');
      }
      
      messagesData = await response.json();
    }
    
    // Sort by date (newest first)
    const sortedMessages = [...messagesData].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Update the all messages section
    renderMessagesSection(sortedMessages);
    
  } catch (error) {
    console.error('Error loading all messages:', error);
    document.getElementById('all-messages').innerHTML = `<p class="text-center text-red-500">Error loading messages</p>`;
  }
}

// Render the messages section with the given data
function renderMessagesSection(messages) {
  const messagesContainer = document.getElementById('all-messages');
  
  if (messages.length === 0) {
    messagesContainer.innerHTML = `<p class="text-center text-gray-500">No messages found</p>`;
    return;
  }
  
  messagesContainer.innerHTML = messages.map(message => `
    <div class="bg-white shadow-md rounded-lg overflow-hidden ${!message.read ? 'border-l-4 border-blue-500' : ''}">
      <div class="p-6">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-medium ${!message.read ? 'text-blue-600' : 'text-gray-900'}">${message.subject}</h3>
            <p class="text-sm text-gray-500 mt-1">From: ${message.name} (${message.email})</p>
          </div>
          <span class="text-xs text-gray-500">${message.date}</span>
        </div>
        <p class="text-gray-700 mt-4">${message.message.substring(0, 150)}${message.message.length > 150 ? '...' : ''}</p>
        <div class="mt-4 flex justify-end">
          <button class="view-message-btn bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200" data-id="${message.id}">View Full Message</button>
        </div>
      </div>
    </div>
  `).join('');
  
  // Add event listeners to the view message buttons
  addMessageViewListeners();
}

// Filter messages based on read status
function filterMessages(status) {
  if (status === 'all') {
    renderMessagesSection(messagesData);
    return;
  }
  
  const isRead = status === 'read';
  const filteredMessages = messagesData.filter(message => message.read === isRead);
  renderMessagesSection(filteredMessages);
}

// Add event listeners to booking action buttons
function addBookingActionListeners() {
  // View details buttons
  document.querySelectorAll('.view-booking-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const bookingId = parseInt(this.getAttribute('data-id'));
      showBookingDetails(bookingId);
    });
  });
  
  // Approve buttons
  document.querySelectorAll('.approve-booking-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const bookingId = parseInt(this.getAttribute('data-id'));
      updateBookingStatus(bookingId, 'approved');
    });
  });
  
  // Reject buttons
  document.querySelectorAll('.reject-booking-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const bookingId = parseInt(this.getAttribute('data-id'));
      updateBookingStatus(bookingId, 'rejected');
    });
  });
}

// Add event listeners to message view buttons
function addMessageViewListeners() {
  document.querySelectorAll('.view-message-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const messageId = parseInt(this.getAttribute('data-id'));
      showMessageDetails(messageId);
    });
  });
}

// Show booking details in modal
function showBookingDetails(bookingId) {
  const booking = bookingsData.find(b => b.id === bookingId);
  if (!booking) return;
  
  currentBookingId = bookingId;
  
  const detailsContent = document.getElementById('booking-details-content');
  detailsContent.innerHTML = `
    <div class="space-y-4">
      <div>
        <h4 class="text-sm font-medium text-gray-500">Client Information</h4>
        <p class="text-lg font-semibold">${booking.name}</p>
        <p class="text-gray-700">${booking.email}</p>
        <p class="text-gray-700">${booking.phone || 'No phone provided'}</p>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <h4 class="text-sm font-medium text-gray-500">Event Type</h4>
          <p class="text-gray-700">${booking.eventType}</p>
        </div>
        <div>
          <h4 class="text-sm font-medium text-gray-500">Event Date</h4>
          <p class="text-gray-700">${booking.date}</p>
        </div>
        <div>
          <h4 class="text-sm font-medium text-gray-500">Attendees</h4>
          <p class="text-gray-700">${booking.attendees || 'Not specified'}</p>
        </div>
        <div>
          <h4 class="text-sm font-medium text-gray-500">Budget</h4>
          <p class="text-gray-700">${booking.budget || 'Not specified'}</p>
        </div>
      </div>
      
      <div>
        <h4 class="text-sm font-medium text-gray-500">Event Details</h4>
        <p class="text-gray-700 whitespace-pre-line">${booking.details || 'No details provided'}</p>
      </div>
      
      <div>
        <h4 class="text-sm font-medium text-gray-500">Status</h4>
        <p>
          <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}">
            ${capitalizeFirstLetter(booking.status)}
          </span>
        </p>
      </div>
    </div>
  `;
  
  // Show/hide action buttons based on status
  const approveBtn = document.getElementById('approve-booking-btn');
  const rejectBtn = document.getElementById('reject-booking-btn');
  
  if (booking.status === 'pending') {
    approveBtn.classList.remove('hidden');
    rejectBtn.classList.remove('hidden');
  } else {
    approveBtn.classList.add('hidden');
    rejectBtn.classList.add('hidden');
  }
  
  // Show the modal
  document.getElementById('booking-details-modal').classList.remove('hidden');
}

// Close booking details modal
function closeBookingModal() {
  document.getElementById('booking-details-modal').classList.add('hidden');
  currentBookingId = null;
}

// Show message details in modal
function showMessageDetails(messageId) {
  const message = messagesData.find(m => m.id === messageId);
  if (!message) return;
  
  currentMessageId = messageId;
  
  // Mark message as read if it's unread
  if (!message.read) {
    markMessageAsRead(messageId);
  }
  
  const detailsContent = document.getElementById('message-details-content');
  detailsContent.innerHTML = `
    <div class="space-y-4">
      <div>
        <h4 class="text-sm font-medium text-gray-500">From</h4>
        <p class="text-lg font-semibold">${message.name}</p>
        <p class="text-gray-700">${message.email}</p>
      </div>
      
      <div>
        <h4 class="text-sm font-medium text-gray-500">Subject</h4>
        <p class="text-gray-700 font-medium">${message.subject}</p>
      </div>
      
      <div>
        <h4 class="text-sm font-medium text-gray-500">Date</h4>
        <p class="text-gray-700">${message.date}</p>
      </div>
      
      <div>
        <h4 class="text-sm font-medium text-gray-500">Message</h4>
        <p class="text-gray-700 whitespace-pre-line">${message.message}</p>
      </div>
    </div>
  `;
  
  // Show the modal
  document.getElementById('message-details-modal').classList.remove('hidden');
}

// Close message details modal
function closeMessageModal() {
  document.getElementById('message-details-modal').classList.add('hidden');
  currentMessageId = null;
}

// Update booking status
async function updateBookingStatus(bookingId, status) {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`/api/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update booking status');
    }
    
    const result = await response.json();
    
    // Update the booking in our data
    const bookingIndex = bookingsData.findIndex(b => b.id === bookingId);
    if (bookingIndex !== -1) {
      bookingsData[bookingIndex].status = status;
    }
    
    // Refresh the UI
    if (document.getElementById('dashboard-section').classList.contains('hidden')) {
      // We're in the bookings section
      const filterValue = document.getElementById('booking-filter').value;
      filterBookings(filterValue);
    } else {
      // We're in the dashboard
      loadRecentBookings();
    }
    
    // Update dashboard stats
    loadDashboardStats();
    
    // Close the modal if it's open
    if (currentBookingId === bookingId) {
      closeBookingModal();
    }
    
    // Show success message
    alert(`Booking #${bookingId} has been ${status}.`);
    
  } catch (error) {
    console.error('Error updating booking status:', error);
    alert('Failed to update booking status. Please try again.');
  }
}

// Mark message as read
async function markMessageAsRead(messageId) {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`/api/messages/${messageId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark message as read');
    }
    
    const result = await response.json();
    
    // Update the message in our data
    const messageIndex = messagesData.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
      messagesData[messageIndex].read = true;
    }
    
    // Update dashboard stats
    loadDashboardStats();
    
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
}

// Helper function to get status badge class
function getStatusBadgeClass(status) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Helper function to get booking action buttons
function getBookingActions(booking) {
  if (booking.status === 'pending') {
    return `
      <button class="view-booking-btn text-blue-600 hover:text-blue-900 mr-3" data-id="${booking.id}">View</button>
      <button class="approve-booking-btn text-green-600 hover:text-green-900 mr-3" data-id="${booking.id}">Approve</button>
      <button class="reject-booking-btn text-red-600 hover:text-red-900" data-id="${booking.id}">Reject</button>
    `;
  } else {
    return `<button class="view-booking-btn text-blue-600 hover:text-blue-900" data-id="${booking.id}">View Details</button>`;
  }
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Start polling for new data
function startPolling() {
  // Clear any existing interval
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
  
  // Store initial counts
  lastBookingCount = bookingsData.length;
  lastMessageCount = messagesData.length;
  
  // Set up polling interval (check every 10 seconds)
  pollingInterval = setInterval(async () => {
    try {
      // Check for new data
      await checkForNewData();
    } catch (error) {
      console.error('Error during polling:', error);
    }
  }, 10000); // 10 seconds
  
  console.log('Polling for new data started');
}

// Stop polling for new data
function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log('Polling for new data stopped');
  }
}

// Check for new bookings and messages
async function checkForNewData() {
  try {
    const token = localStorage.getItem('admin_token');
    
    // Check for new bookings
    const bookingsResponse = await fetch('/api/bookings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (bookingsResponse.ok) {
      const bookings = await bookingsResponse.json();
      
      // If there are new bookings
      if (bookings.length > lastBookingCount) {
        console.log(`New bookings detected: ${bookings.length - lastBookingCount} new booking(s)`);
        
        // Update the data
        bookingsData = bookings;
        lastBookingCount = bookings.length;
        
        // Show notification
        showNotification('New booking received!', 'A new booking request has been submitted.');
        
        // Update UI based on current view
        const currentView = getCurrentView();
        if (currentView === 'dashboard') {
          loadDashboardStats();
          loadRecentBookings();
        } else if (currentView === 'bookings') {
          loadAllBookings();
        }
      }
    }
    
    // Check for new messages
    const messagesResponse = await fetch('/api/messages', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (messagesResponse.ok) {
      const messages = await messagesResponse.json();
      
      // If there are new messages
      if (messages.length > lastMessageCount) {
        console.log(`New messages detected: ${messages.length - lastMessageCount} new message(s)`);
        
        // Update the data
        messagesData = messages;
        lastMessageCount = messages.length;
        
        // Show notification
        showNotification('New message received!', 'A new message has been submitted.');
        
        // Update UI based on current view
        const currentView = getCurrentView();
        if (currentView === 'dashboard') {
          loadDashboardStats();
          loadRecentMessages();
        } else if (currentView === 'messages') {
          loadAllMessages();
        }
      }
    }
  } catch (error) {
    console.error('Error checking for new data:', error);
  }
}

// Show a notification to the admin
function showNotification(title, message) {
  // Create notification element if it doesn't exist
  let notificationContainer = document.getElementById('notification-container');
  
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.style.position = 'fixed';
    notificationContainer.style.top = '20px';
    notificationContainer.style.right = '20px';
    notificationContainer.style.zIndex = '1000';
    document.body.appendChild(notificationContainer);
  }
  
  // Create notification
  const notification = document.createElement('div');
  notification.className = 'bg-blue-600 text-white p-4 rounded-lg shadow-lg mb-4 transform transition-all duration-300 translate-x-full';
  notification.innerHTML = `
    <div class="flex items-center">
      <div class="flex-shrink-0">
        <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="font-medium">${title}</h3>
        <div class="mt-1 text-sm">${message}</div>
      </div>
      <div class="ml-4 flex-shrink-0 flex">
        <button class="inline-flex text-white focus:outline-none focus:text-gray-200">
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  `;
  
  // Add notification to container
  notificationContainer.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 10);
  
  // Add click event to close button
  notification.querySelector('button').addEventListener('click', () => {
    notification.classList.add('translate-x-full');
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
  
  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }
  }, 5000);
  
  // Try to play notification sound if available
  try {
    // Check if the notification sound file exists before playing
    fetch('/notification.mp3', { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log('Could not play notification sound'));
        }
      })
      .catch(() => {
        console.log('Notification sound file not available');
      });
  } catch (e) {
    console.log('Notification system not available');
  }
}

// Get the current view/section
function getCurrentView() {
  if (!document.getElementById('dashboard-section').classList.contains('hidden')) {
    return 'dashboard';
  } else if (!document.getElementById('bookings-section').classList.contains('hidden')) {
    return 'bookings';
  } else if (!document.getElementById('messages-section').classList.contains('hidden')) {
    return 'messages';
  }
  return 'dashboard'; // Default
}
