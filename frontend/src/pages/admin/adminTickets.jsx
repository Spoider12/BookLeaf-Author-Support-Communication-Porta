
import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios";

const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

const PRIORITIES = ["Critical", "High", "Medium", "Low"];

const CATEGORIES = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
  "General",
  "Account Level",
];

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: "",
    from: "",
    to: "",
  });

  const [assignedTo, setAssignedTo] = useState("");
  const [categoryOverride, setCategoryOverride] = useState("");
  const [priorityOverride, setPriorityOverride] = useState("");
  const [note, setNote] = useState("");
  const [reply, setReply] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value)
      );

      const response = await api.get("/tickets", {
        ...authConfig,
        params,
      });

      const loadedTickets = response.data.tickets || [];
      setTickets(loadedTickets);

      setSelectedTicket((current) => {
        if (!current) return null;

        return (
          loadedTickets.find((ticket) => ticket._id === current._id) ||
          null
        );
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load support tickets."
      );
    } finally {
      setLoading(false);
    }
  }, [
    filters.status,
    filters.category,
    filters.priority,
    filters.from,
    filters.to,
  ]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    setAssignedTo(selectedTicket?.assignedTo || "");
    setCategoryOverride(selectedTicket?.category || "");
    setPriorityOverride(selectedTicket?.priority || "");
    setNote("");
    setReply("");
  }, [selectedTicket?._id]);

  const performAction = async (action, successMessage) => {
    setError("");
    setMessage("");
    setActionLoading(true);

    try {
      await action();
      setMessage(successMessage || "Changes saved successfully.");
      await loadTickets();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "The action failed. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const updateStatus = (status) =>
    performAction(
      () =>
        api.patch(
          `/tickets/${selectedTicket._id}/status`,
          { status },
          authConfig
        ),
      "Ticket status updated successfully."
    );

  const saveClassification = () => {
    if (!categoryOverride || !priorityOverride) {
      setError("Select both a category and a priority.");
      return;
    }

    return performAction(
      () =>
        api.patch(
          `/tickets/${selectedTicket._id}/classification`,
          {
            category: categoryOverride,
            priority: priorityOverride,
          },
          authConfig
        ),
      "Category and priority updated successfully."
    );
  };

  const assignTicket = () => {
    if (!assignedTo.trim()) {
      setError("Enter an agent name or ID.");
      return;
    }

    return performAction(
      () =>
        api.patch(
          `/tickets/${selectedTicket._id}/assign`,
          { assignedTo: assignedTo.trim() },
          authConfig
        ),
      "Ticket assigned successfully."
    );
  };

  const addInternalNote = () => {
    if (!note.trim()) {
      setError("Enter an internal note.");
      return;
    }

    return performAction(async () => {
      await api.post(
        `/tickets/${selectedTicket._id}/internal-notes`,
        { message: note.trim() },
        authConfig
      );
      setNote("");
    }, "Internal note added successfully.");
  };

  const generateDraft = () =>
    performAction(async () => {
      const response = await api.post(
        `/tickets/${selectedTicket._id}/ai-draft`,
        {},
        authConfig
      );

      const draft = response.data.draft;

      setReply(
        typeof draft === "string" ? draft : JSON.stringify(draft)
      );
    }, "AI draft generated. Review and edit it before sending.");

  const sendReply = () => {
    if (!reply.trim()) {
      setError("Enter a reply before sending.");
      return;
    }

    return performAction(async () => {
      await api.post(
        `/tickets/${selectedTicket._id}/replies`,
        { message: reply.trim() },
        authConfig
      );
      setReply("");
    }, "Reply sent successfully.");
  };

  return (
    <main>
      <h1>Admin Ticket Management</h1>
      <p>Review and manage author support requests.</p>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <section>
        <h2>Filter Tickets</h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          <select
            aria-label="Filter by status"
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
          >
            <option value="">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by category"
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
          >
            <option value="">All categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by priority"
            value={filters.priority}
            onChange={(e) =>
              setFilters({ ...filters, priority: e.target.value })
            }
          >
            <option value="">All priorities</option>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>

          <label>
            From
            <input
              type="date"
              value={filters.from}
              onChange={(e) =>
                setFilters({ ...filters, from: e.target.value })
              }
            />
          </label>

          <label>
            To
            <input
              type="date"
              value={filters.to}
              onChange={(e) =>
                setFilters({ ...filters, to: e.target.value })
              }
            />
          </label>

          <button type="button" onClick={loadTickets}>
            Refresh tickets
          </button>
        </div>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Ticket Queue ({tickets.length})</h2>

        {loading ? (
          <p>Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p>No tickets found for these filters.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">Subject</th>
                  <th align="left">Author ID</th>
                  <th align="left">Category</th>
                  <th align="left">Priority</th>
                  <th align="left">Status</th>
                  <th align="left">Submitted</th>
                  <th align="left">Action</th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>{ticket.subject}</td>
                    <td>{ticket.authorId}</td>
                    <td>{ticket.category}</td>
                    <td>{ticket.priority}</td>
                    <td>{ticket.status}</td>
                    <td>
                      {ticket.createdAt
                        ? new Date(ticket.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedTicket && (
        <section
          style={{
            marginTop: "28px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <h2>Ticket Details</h2>

          <p>
            <strong>Subject:</strong> {selectedTicket.subject}
          </p>
          <p>
            <strong>Author ID:</strong> {selectedTicket.authorId}
          </p>
          <p>
            <strong>Book ID:</strong>{" "}
            {selectedTicket.bookId || "General / Account Level"}
          </p>
          <p>
            <strong>Query:</strong>
          </p>
          <p style={{ whiteSpace: "pre-wrap" }}>
            {selectedTicket.description}
          </p>

          <h3>AI Classification — Admin Override</h3>
          <p>
            Review the AI classification and change either field if needed.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <label>
              Category
              <br />
              <select
                value={categoryOverride}
                disabled={actionLoading}
                onChange={(e) => setCategoryOverride(e.target.value)}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Priority
              <br />
              <select
                value={priorityOverride}
                disabled={actionLoading}
                onChange={(e) => setPriorityOverride(e.target.value)}
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              disabled={actionLoading}
              onClick={saveClassification}
            >
              {actionLoading
                ? "Saving..."
                : "Save Category & Priority"}
            </button>
          </div>

          <h3>Update Status</h3>
          <label>
            Status
            <select
              value={selectedTicket.status}
              disabled={actionLoading}
              onChange={(e) => updateStatus(e.target.value)}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <h3>Assign Ticket</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              assignTicket();
            }}
          >
            <input
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Agent name or ID"
              maxLength={100}
            />
            <button type="submit" disabled={actionLoading}>
              Assign
            </button>
          </form>

          <h3>Conversation</h3>

          {selectedTicket.responses?.length ? (
            selectedTicket.responses.map((item, index) => (
              <div key={item._id || index}>
                <strong>
                  {item.senderRole === "admin" ? "Support" : "Author"}
                </strong>
                <p style={{ whiteSpace: "pre-wrap" }}>{item.message}</p>
                <small>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : ""}
                </small>
              </div>
            ))
          ) : (
            <p>No replies yet.</p>
          )}

          <h3>Internal Notes (Admin Only)</h3>

          {selectedTicket.internalNotes?.map((item, index) => (
            <div key={item._id || index}>
              <p style={{ whiteSpace: "pre-wrap" }}>{item.message}</p>
              <small>
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleString()
                  : ""}
              </small>
            </div>
          ))}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              addInternalNote();
            }}
          >
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write an internal note"
              rows={3}
              maxLength={2000}
            />
            <button type="submit" disabled={actionLoading}>
              Add Internal Note
            </button>
          </form>

          <h3>Reply to Author</h3>

          <button
            type="button"
            disabled={
              actionLoading || selectedTicket.status === "Closed"
            }
            onClick={generateDraft}
          >
            Generate AI Draft
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendReply();
            }}
          >
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write or edit the reply before sending"
              rows={5}
              maxLength={5000}
              required
            />
            <button
              type="submit"
              disabled={
                actionLoading || selectedTicket.status === "Closed"
              }
            >
              Send Reply
            </button>
          </form>

          <button
            type="button"
            onClick={() => setSelectedTicket(null)}
            style={{ marginTop: "12px" }}
          >
            Close Details
          </button>
        </section>
      )}
    </main>
  );
}
