
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Auth.css";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", form);
      navigate("/", {
        state: { message: "Account created. Please sign in." },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo">B</div>
        <p className="auth-eyebrow">BOOKLEAF PUBLISHING</p>
        <h1>Create your account</h1>
        <p className="auth-subtitle">
          Register to access the author support portal.
        </p>

        <form onSubmit={handleSignup} className="auth-form">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your full name"
            autoComplete="name"
            required
          />

          <label htmlFor="signup-email">Email address</label>
          <input
            id="signup-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
            autoComplete="new-password"
            minLength={8}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
