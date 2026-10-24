
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./PortalLayout.css";

export default function PortalLayout({ role, navigation }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <div className="portal-layout">
      <aside className={`portal-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="portal-brand">
          <span className="portal-brand-icon">B</span>
          <div>
            <strong>BookLeaf</strong>
            <small>Support Portal</small>
          </div>
        </div>

        <p className="portal-nav-label">{role} WORKSPACE</p>

        <nav className="portal-nav">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `portal-nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="portal-sidebar-footer">
          <span className="portal-avatar">
            {(user.name || role).charAt(0).toUpperCase()}
          </span>
          <div className="portal-user-info">
            <strong>{user.name || role}</strong>
            <small>{user.email || ""}</small>
          </div>
          <button
            className="portal-logout"
            onClick={handleLogout}
            title="Log out"
          >
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="portal-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="portal-main">
        <header className="portal-header">
          <button
            className="portal-menu-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>

          <div>
            <strong>{role} Portal</strong>
            <p>BookLeaf Author Support</p>
          </div>
        </header>

        <section className="portal-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
