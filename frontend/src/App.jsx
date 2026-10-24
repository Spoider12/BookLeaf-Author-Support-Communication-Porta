
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function PortalPlaceholder({ role }) {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>{role} Portal</h1>
      <p>Your dashboard will be built in the next step.</p>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin" element={<PortalPlaceholder role="Admin" />} />
      <Route path="/author" element={<PortalPlaceholder role="Author" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
