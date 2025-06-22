# Event Management System

A modern, visually stunning event management system with 3D animated homepage, booking system, and professional admin dashboard.

## Features
- 3D animated homepage (React Three Fiber)
- Modern, responsive UI (Tailwind CSS)
- Booking form for users
- Admin dashboard to manage bookings/events
- Separate admin login

## Tech Stack
- React, Vite, Tailwind CSS, Three.js (React Three Fiber), Framer Motion
- Node.js, Express, MongoDB

## Getting Started
1. Install dependencies: `npm install`
2. Start frontend: `npm run dev`
3. Start backend: `npm run start-server`

---

## Folder Structure
- `/src` - Frontend source code
- `/server` - Backend API

- 📁 Eventify Admin Panel – Complete Frontend Module
The Eventify Admin Panel is a modular and dynamic web-based interface tailored for managing event-related services efficiently. This repository contains the frontend components required to build and operate an event management system, focused on both end-users and administrators. The three core files—about.html, admin-login.html, and admin-dashboard.js—each play a critical role in ensuring a seamless user experience, from storytelling to secure admin access and real-time dashboard functionality.

1. About Page (about.html)
The about.html file serves as the "About Us" section for the Eventify platform. It is designed using modern web practices, including Tailwind CSS and responsive design principles, to ensure optimal performance across devices. The page introduces the company’s background and vision, highlighting that Eventify was founded in 2020 to revolutionize the event management space. Through well-structured and semantically rich HTML, it presents the company’s story, mission, values, and team members using grid layouts and stylized sections. The three core values—Excellence, Collaboration, and Innovation—are emphasized through icon-supported cards that make the layout visually engaging.

The About page is not just static content. It provides an emotional connection with potential clients by showing human faces behind the brand, including roles such as CEO, Creative Director, Technical Lead, and Event Manager. The use of professional headshots and background images further enhances credibility. This file is essential for branding and establishing trust among visitors, giving the company a solid web presence.

2. Admin Login Page (admin-login.html)
The admin-login.html file is a dedicated authentication page designed for Eventify administrators. With a clean and minimalistic design, it prioritizes usability and clarity. The form accepts a username and password, both of which are required fields, and validates the inputs before sending a request to the backend API. The JavaScript embedded in the HTML is responsible for handling the login logic securely.

Upon successful login, the file stores the admin token and user data in localStorage to maintain session persistence and redirects the user to the admin dashboard. In case of invalid credentials or errors, appropriate messages are displayed, enhancing user experience and transparency. The page also includes a “Back to Homepage” link to guide users away if they reach the admin page unintentionally.

The form uses Tailwind classes for styling, which results in a professional and polished interface. Additionally, there's a directLogin() function included for testing or QA environments, allowing quick login using pre-defined credentials. This feature is especially useful during development or demo sessions.

3. Admin Dashboard Script (admin-dashboard.js)
The admin-dashboard.js is the most dynamic and feature-rich component in the system. It controls the functionality of the admin panel after a successful login and provides administrators with all the tools they need to manage bookings and messages efficiently. Once loaded, the script first checks for authentication by validating the presence of the admin token and user details. If authenticated, it reveals the dashboard UI and begins fetching data from the backend.

This JavaScript file performs multiple roles:

Data Loading & Display: It fetches data from /api/bookings, /api/messages, and /api/dashboard/stats to populate the dashboard with the most recent stats, including total bookings, pending bookings, and unread messages.

Real-time Polling: A polling mechanism checks for new bookings and messages every 10 seconds, ensuring that the admin always sees the latest updates without needing a manual refresh. If new data is detected, the system notifies the admin visually and with sound (if available).

Section Navigation: The script handles seamless navigation between different sections of the admin panel—Dashboard, Bookings, and Messages. Each section is conditionally shown or hidden based on user interaction.

Filtering and Actions: Admins can filter bookings and messages by status (e.g., pending, approved, read/unread). Booking actions such as "Approve", "Reject", and "View Details" are implemented with dedicated event listeners, providing a complete moderation experience.

Modal Handling: When an admin clicks "View", modals open to display detailed booking or message data. These modals are dynamically generated, formatted, and managed using plain JavaScript and Tailwind classes.

Logout Functionality: A secure logout feature is implemented to clear session data and redirect the admin to the login page, maintaining data privacy and session integrity.

Notification System: The file includes a visually engaging notification system that alerts admins when new bookings or messages are received. These notifications appear in the top-right corner with fade-in and fade-out transitions and optional sound feedback using a /notification.mp3 audio file.

Helper functions like capitalizeFirstLetter, getStatusBadgeClass, and various render* and load* functions promote clean, modular, and reusable code. The result is a highly responsive and user-friendly dashboard experience for administrators.

✨ Project Highlights
Frontend Stack: HTML, Tailwind CSS, and Vanilla JavaScript.

Security: Token-based authentication managed through localStorage.

UX Features: Real-time updates, modal displays, error handling, success alerts.

Responsiveness: Fully responsive layout with mobile and desktop support.

Modularity: Clean separation of concerns—UI (about.html, admin-login.html) and Logic (admin-dashboard.js).

Custom Notifications: Both visual and auditory notifications for new data.

Ready for Backend Integration: The files are structured to work seamlessly with a Node.js, Express, or any REST API backend.

🚀 How to Use
Clone this repository.

Place the files inside your web project’s public folder.

Ensure your backend endpoints (/api/admin/login, /api/bookings, /api/messages, etc.) are up and running.

Open admin-login.html in a browser, log in using valid credentials, and explore the admin dashboard.

🛠️ Future Improvements
Add error tracking and analytics tools for admin actions.

Include role-based access (e.g., Super Admin, Editor).

Enhance mobile responsiveness for dashboard view.

Add animations and transitions for smoother UX.

Implement dark mode support using Tailwind.
