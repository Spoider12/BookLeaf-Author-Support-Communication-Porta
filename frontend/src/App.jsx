
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function PortalPlaceholder({ role }) {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>{role} Portal</h1>
      <p>You have accessed the protected {role.toLowerCase()} route.</p>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <PortalPlaceholder role="Admin" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/author"
        element={
          <ProtectedRoute allowedRole="author">
            <PortalPlaceholder role="Author" />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
