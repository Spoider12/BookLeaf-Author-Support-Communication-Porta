
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const formatAmount = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export default function AuthorDashboard() {
  const [books, setBooks] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [booksResponse, ticketsResponse] = await Promise.all([
          api.get("/books", config),
          api.get("/tickets", config),
        ]);

        setBooks(booksResponse.data.books || []);
        setTickets(ticketsResponse.data.tickets || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load dashboard data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <p>Loading your dashboard...</p>;
  }

  if (error) {
    return (
      <div>
        <h1>Author Dashboard</h1>
        <p role="alert">{error}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  const totalBooks = books.length;

  const totalCopiesSold = books.reduce(
    (sum, book) => sum + (Number(book.total_copies_sold) || 0),
    0
  );

  const totalRoyalties = books.reduce(
    (sum, book) => sum + (Number(book.total_royalty_earned) || 0),
    0
  );

  const paidRoyalties = books.reduce(
    (sum, book) => sum + (Number(book.royalty_paid) || 0),
    0
  );

  const pendingRoyalties = books.reduce(
    (sum, book) => sum + (Number(book.royalty_pending) || 0),
    0
  );

  const recentTickets = [...tickets]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )
    .slice(0, 5);

  const stats = [
    { label: "Total Books", value: totalBooks },
    { label: "Copies Sold", value: totalCopiesSold },
    { label: "Total Royalties", value: formatAmount(totalRoyalties) },
    { label: "Royalties Paid", value: formatAmount(paidRoyalties) },
    {
      label: "Royalties Pending",
      value: formatAmount(pendingRoyalties),
    },
    { label: "Support Tickets", value: tickets.length },
  ];

  return (
    <main style={{ padding: "8px" }}>
      <h1>Author Dashboard</h1>
      <p>Welcome back! Here's an overview of your books and support requests.</p>

      <section
        aria-label="Author statistics"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          margin: "24px 0",
        }}
      >
        {stats.map((stat) => (
          <article
            key={stat.label}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "18px",
            }}
          >
            <p style={{ margin: "0 0 8px", color: "#666" }}>
              {stat.label}
            </p>
            <h2 style={{ margin: 0, overflowWrap: "anywhere" }}>
              {stat.value}
            </h2>
          </article>
        ))}
      </section>

      <section style={{ marginBottom: "28px" }}>
        <h2>Quick Actions</h2>
        <nav style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <Link to="/author/books">View My Books</Link>
          <Link to="/author/tickets">View My Tickets</Link>
          <Link to="/author/tickets/new">Create a Ticket</Link>
        </nav>
      </section>

      <section>
        <h2>Recent Support Tickets</h2>

        {recentTickets.length === 0 ? (
          <p>You haven't submitted any support tickets yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px" }}>Subject</th>
                  <th style={{ textAlign: "left", padding: "10px" }}>Status</th>
                  <th style={{ textAlign: "left", padding: "10px" }}>Priority</th>
                  <th style={{ textAlign: "left", padding: "10px" }}>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td style={{ padding: "10px", borderTop: "1px solid #ddd" }}>
                      {ticket.subject}
                    </td>
                    <td style={{ padding: "10px", borderTop: "1px solid #ddd" }}>
                      {ticket.status}
                    </td>
                    <td style={{ padding: "10px", borderTop: "1px solid #ddd" }}>
                      {ticket.priority}
                    </td>
                    <td style={{ padding: "10px", borderTop: "1px solid #ddd" }}>
                      {ticket.createdAt
                        ? new Date(ticket.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p style={{ marginTop: "16px" }}>
          <Link to="/author/tickets">View all tickets →</Link>
        </p>
      </section>
    </main>
  );
}
