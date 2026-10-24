
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PortalLayout from "./components/PortalLayout.jsx";
import AuthorDashboard from "./pages/author/authorDashboard.jsx";
import MyBooks from "./pages/author/MyBooks.jsx";
import MyTickets from "./pages/author/MyTickets.jsx";
import CreateTicket from "./pages/author/CreateTicket.jsx";

// Admin pages
function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the BookLeaf administration portal.</p>
    </div>
  );
}

function AdminTickets() {
  return (
    <div>
      <h1>Ticket Queue</h1>
      <p>Manage author support tickets here.</p>
    </div>
  );
}

// Author navigation
const authorNavigation = [
  { label: "Dashboard", to: "/author", end: true },
  { label: "My Books", to: "/author/books" },
  { label: "My Tickets", to: "/author/tickets" },
  { label: "Submit a Ticket", to: "/author/tickets/new" },
];

// Admin navigation
const adminNavigation = [
  { label: "Dashboard", to: "/admin", end: true },
  { label: "Ticket Queue", to: "/admin/tickets" },
];

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Author routes */}
      <Route
        path="/author"
        element={
          <ProtectedRoute allowedRole="author">
            <PortalLayout
              role="Author"
              navigation={authorNavigation}
            />
          </ProtectedRoute>
        }
      >
        <Route index element={<AuthorDashboard />} />
        <Route path="books" element={<MyBooks />} />
        <Route path="tickets" element={<MyTickets />} />
        <Route path="tickets/new" element={<CreateTicket />} />
      </Route>

      {/* Protected Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <PortalLayout
              role="Admin"
              navigation={adminNavigation}
            />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="tickets" element={<AdminTickets />} />
      </Route>

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
