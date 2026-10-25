
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("api/auth/login", {
        email,
        password,
      });

      const { token, user } = data;

      if (!token || !user) {
        throw new Error("Invalid login response.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "author") {
        navigate("/author");
      } else {
        setError("Unrecognized account role.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to log in."
      );
    } finally {
      setLoading(false);
    }
  };
  {successMessage && (
  <p className="auth-success">{successMessage}</p>
)}

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo">B</div>
        <p className="auth-eyebrow">BOOKLEAF PUBLISHING</p>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">
          Sign in to access your support portal.
        </p>

        <form onSubmit={handleLogin} className="auth-form">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          New to BookLeaf? <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
