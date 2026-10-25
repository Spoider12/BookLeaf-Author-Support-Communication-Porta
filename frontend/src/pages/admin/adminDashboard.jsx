
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import "./adminDashboard.css";

const UNRESOLVED_STATUSES = ["Open", "In Progress"];

const PRIORITY_ORDER = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

function getTicketDate(ticket) {
  const value =
    ticket.createdAt || ticket.created_at || ticket.createdOn;

  const date = value ? new Date(value) : null;

  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function formatDate(ticket) {
  const date = getTicketDate(ticket);

  return date
    ? date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date unavailable";
}

function getTicketSubject(ticket) {
  return ticket.subject || ticket.title || "Untitled ticket";
}

function getAuthorName(ticket) {
  if (typeof ticket.author === "string") {
    return ticket.author;
  }

  return (
    ticket.author?.name ||
    ticket.author?.fullName ||
    ticket.author?.email ||
    ticket.authorName ||
    "Author"
  );
}

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in to access the dashboard.");
      }

      const response = await api.get("/tickets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      const loadedTickets = Array.isArray(data)
        ? data
        : data.tickets || [];

      setTickets(loadedTickets);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "Open"
  );

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "In Progress"
  );

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "Resolved"
  );

  const closedTickets = tickets.filter(
    (ticket) => ticket.status === "Closed"
  );

  const unresolvedTickets = tickets.filter((ticket) =>
    UNRESOLVED_STATUSES.includes(ticket.status)
  );

  const urgentTickets = unresolvedTickets
    .filter((ticket) =>
      ["Critical", "High"].includes(ticket.priority)
    )
    .sort((a, b) => {
      const priorityDifference =
        (PRIORITY_ORDER[a.priority] ?? 99) -
        (PRIORITY_ORDER[b.priority] ?? 99);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      const dateA = getTicketDate(a)?.getTime() ?? Infinity;
      const dateB = getTicketDate(b)?.getTime() ?? Infinity;

      return dateA - dateB;
    })
    .slice(0, 5);

  if (loading) {
    return (
      <section className="admin-dashboard">
        <p>Loading dashboard...</p>
      </section>
    );
  }

  return (
    <section className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <p className="admin-eyebrow">BOOKLEAF OPERATIONS</p>
          <h1>Admin Dashboard</h1>
          <p>
            Monitor incoming author queries and prioritize
            unresolved support requests.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="admin-refresh-button"
        >
          Refresh data
        </button>
      </header>

      {error && (
        <div className="admin-dashboard-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={loadDashboard}>
            Try again
          </button>
        </div>
      )}

      {!error && (
        <>
          <div className="admin-stats-grid">
            <article className="admin-stat-card">
              <span>Total tickets</span>
              <strong>{tickets.length}</strong>
              <small>All returned tickets</small>
            </article>

            <article className="admin-stat-card">
              <span>Open tickets</span>
              <strong>{openTickets.length}</strong>
              <small>Awaiting action</small>
            </article>

            <article className="admin-stat-card">
              <span>In progress</span>
              <strong>{inProgressTickets.length}</strong>
              <small>Being handled</small>
            </article>

            <article className="admin-stat-card">
              <span>Resolved</span>
              <strong>{resolvedTickets.length}</strong>
              <small>Successfully resolved</small>
            </article>
          </div>

          <section className="admin-urgent-section">
            <div className="admin-section-header">
              <div>
                <h2>Urgent tickets</h2>
                <p>
                  Critical and high-priority tickets that remain
                  unresolved.
                </p>
              </div>

              <Link to="/admin/tickets">
                Open ticket queue →
              </Link>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-urgent-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Author</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>

                <tbody>
                  {urgentTickets.map((ticket) => (
                    <tr key={ticket._id}>
                      <td>{getTicketSubject(ticket)}</td>
                      <td>{getAuthorName(ticket)}</td>
                      <td>
                        <span
                          className={`admin-priority-badge priority-${(
                            ticket.priority || "unknown"
                          )
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {ticket.priority || "Unassigned"}
                        </span>
                      </td>
                      <td>{ticket.status || "Unknown"}</td>
                      <td>{formatDate(ticket)}</td>
                    </tr>
                  ))}

                  {urgentTickets.length === 0 && (
                    <tr>
                      <td colSpan="5" className="admin-empty-state">
                        No unresolved Critical or High priority
                        tickets found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-dashboard-footer">
              <span>
                Closed tickets: <strong>{closedTickets.length}</strong>
              </span>

              <span>
                Unresolved tickets:{" "}
                <strong>{unresolvedTickets.length}</strong>
              </span>

              <Link to="/admin/tickets">
                Manage all tickets
              </Link>
            </div>
          </section>
        </>
      )}
    </section>
  );
}
