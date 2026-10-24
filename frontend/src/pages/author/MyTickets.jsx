
import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get("/tickets", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setTickets(response.data.tickets || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load your tickets. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  if (loading) {
    return <div><h1>My Tickets</h1><p>Loading your tickets...</p></div>;
  }

  if (error) {
    return (
      <div>
        <h1>My Tickets</h1>
        <p role="alert">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>My Tickets</h1>
      <p>View your support requests and responses here.</p>

      {tickets.length === 0 ? (
        <p>You haven't submitted any support tickets yet.</p>
      ) : (
        <div>
          {tickets.map((ticket) => (
            <article
              key={ticket._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "16px",
                marginTop: "16px",
              }}
            >
              <h2>{ticket.subject}</h2>

              <p>
                <strong>Status:</strong> {ticket.status}
              </p>

              <p>
                <strong>Category:</strong> {ticket.category}
              </p>

              <p>
                <strong>Priority:</strong> {ticket.priority}
              </p>

              <p>
                <strong>Submitted:</strong>{" "}
                {ticket.createdAt
                  ? new Date(ticket.createdAt).toLocaleString()
                  : "Not available"}
              </p>

              <div>
                <strong>Your query:</strong>
                <p style={{ whiteSpace: "pre-wrap" }}>
                  {ticket.description}
                </p>
              </div>

              <div>
                <h3>Responses</h3>

                {!ticket.responses?.length ? (
                  <p>No responses from support yet.</p>
                ) : (
                  ticket.responses.map((reply, index) => (
                    <div
                      key={reply._id || `${ticket._id}-${index}`}
                      style={{
                        borderLeft: "3px solid #ccc",
                        paddingLeft: "12px",
                        marginTop: "12px",
                      }}
                    >
                      <p>
                        <strong>
                          {reply.senderRole === "admin"
                            ? "BookLeaf Support"
                            : "You"}
                        </strong>
                      </p>

                      <p style={{ whiteSpace: "pre-wrap" }}>
                        {reply.message}
                      </p>

                      <small>
                        {reply.createdAt
                          ? new Date(reply.createdAt).toLocaleString()
                          : ""}
                      </small>
                    </div>
                  ))
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
