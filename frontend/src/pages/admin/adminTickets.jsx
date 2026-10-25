
import { useCallback, useEffect, useMemo, useState } from "react";
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

const EMPTY_FILTERS = {
  status: "",
  category: "",
  priority: "",
  from: "",
  to: "",
};

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const [assignedTo, setAssignedTo] = useState("");
  const [categoryOverride, setCategoryOverride] = useState("");
  const [priorityOverride, setPriorityOverride] = useState("");
  const [note, setNote] = useState("");
  const [reply, setReply] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const authConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    }),
    []
  );

  const requestParams = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== "")
      ),
    [filters]
  );

  // Fetch tickets. Used by the initial effect, refresh button and actions.
  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/tickets", {
        ...authConfig,
        params: requestParams,
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
          "Unable to load support tickets. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [authConfig, requestParams]);

  // Initial load and reload when filters change.
  // State updates occur after the request completes.
  useEffect(() => {
    let cancelled = false;

    const fetchTickets = async () => {
      try {
        const response = await api.get("/tickets", {
          ...authConfig,
          params: requestParams,
        });

        if (cancelled) return;

        const loadedTickets = response.data.tickets || [];
        setTickets(loadedTickets);

        setSelectedTicket((current) => {
          if (!current) return null;

          return (
            loadedTickets.find((ticket) => ticket._id === current._id) ||
            null
          );
        });

        setError("");
      } catch (err) {
        if (cancelled) return;

        setError(
          err.response?.data?.message ||
            "Unable to load support tickets. Please try again."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchTickets();

    return () => {
      cancelled = true;
    };
  }, [authConfig, requestParams]);

  // Open a ticket and initialize its editable fields.
  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setAssignedTo(ticket.assignedTo || "");
    setCategoryOverride(ticket.category || CATEGORIES[0]);
    setPriorityOverride(ticket.priority || "Medium");
    setNote("");
    setReply("");
    setError("");
    setMessage("");
  };

  const handleCloseDetails = () => {
    setSelectedTicket(null);
    setAssignedTo("");
    setCategoryOverride("");
    setPriorityOverride("");
    setNote("");
    setReply("");
    setError("");
    setMessage("");
  };

  // Shared handler for actions that modify a ticket.
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

  const updateStatus = (status) => {
    if (!selectedTicket) return;

    return performAction(
      () =>
        api.patch(
          `/tickets/${selectedTicket._id}/status`,
          { status },
          authConfig
        ),
      "Ticket status updated successfully."
    );
  };

  const saveClassification = () => {
    if (!selectedTicket) return;

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
    if (!selectedTicket) return;

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
    if (!selectedTicket) return;

    if (!note.trim()) {
      setError("Enter an internal note.");
      return;
    }

    const noteMessage = note.trim();

    return performAction(
      () =>
        api.post(
          `/tickets/${selectedTicket._id}/internal-notes`,
          { message: noteMessage },
          authConfig
        ),
      "Internal note added successfully."
    ).then(() => {
      setNote("");
    });
  };

  const generateDraft = () => {
    if (!selectedTicket) return;

    return performAction(
      async () => {
        const response = await api.post(
          `/tickets/${selectedTicket._id}/ai-draft`,
          {},
          authConfig
        );

        const draft = response.data.draft;

        setReply(
          typeof draft === "string"
            ? draft
            : JSON.stringify(draft, null, 2) || ""
        );
      },
      "AI draft generated. Review and edit it before sending."
    );
  };

  const sendReply = () => {
    if (!selectedTicket) return;

    if (!reply.trim()) {
      setError("Enter a reply before sending.");
      return;
    }

    const replyMessage = reply.trim();

    return performAction(
      () =>
        api.post(
          `/tickets/${selectedTicket._id}/replies`,
          { message: replyMessage },
          authConfig
        ),
      "Reply sent successfully."
    ).then(() => {
      setReply("");
    });
  };

  const updateFilter = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({ ...EMPTY_FILTERS });
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleString();
  };

  const formatReference = (value) => {
    if (!value) return "—";

    if (typeof value === "object") {
      return value.name || value._id || value.id || "—";
    }

    return String(value);
  };

  return (
    <main>
      <header>
        <h1>Admin Ticket Management</h1>
        <p>Review and manage author support requests.</p>
      </header>

      {error && (
        <p role="alert" style={{ color: "crimson" }}>
          {error}
        </p>
      )}

      {message && (
        <p role="status" style={{ color: "green" }}>
          {message}
        </p>
      )}

      <section aria-labelledby="filter-heading">
        <h2 id="filter-heading">Filter Tickets</h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "end",
            gap: "12px",
          }}
        >
          <label>
            Status
            <br />
            <select
              aria-label="Filter by status"
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
            >
              <option value="">All statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label>
            Category
            <br />
            <select
              aria-label="Filter by category"
              value={filters.category}
              onChange={(e) => updateFilter("category", e.target.value)}
            >
              <option value="">All categories</option>
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
              aria-label="Filter by priority"
              value={filters.priority}
              onChange={(e) => updateFilter("priority", e.target.value)}
            >
              <option value="">All priorities</option>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>

          <label>
            From
            <br />
            <input
              type="date"
              aria-label="Filter from date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(e) => updateFilter("from", e.target.value)}
            />
          </label>

          <label>
            To
            <br />
            <input
              type="date"
              aria-label="Filter to date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(e) => updateFilter("to", e.target.value)}
            />
          </label>

          <button type="button" onClick={resetFilters}>
            Clear filters
          </button>

          <button
            type="button"
            onClick={loadTickets}
            disabled={loading || actionLoading}
          >
            {loading ? "Refreshing..." : "Refresh tickets"}
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
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th align="left">Subject</th>
                  <th align="left">Author ID</th>
                  <th align="left">Book ID</th>
                  <th align="left">Category</th>
                  <th align="left">Priority</th>
                  <th align="left">Status</th>
                  <th align="left">Assigned To</th>
                  <th align="left">Submitted</th>
                  <th align="left">Action</th>
                </tr>
              </thead>

              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>{ticket.subject || "Untitled ticket"}</td>
                    <td>{formatReference(ticket.authorId)}</td>
                    <td>{formatReference(ticket.bookId)}</td>
                    <td>{ticket.category || "Unclassified"}</td>
                    <td>{ticket.priority || "—"}</td>
                    <td>{ticket.status || "—"}</td>
                    <td>{formatReference(ticket.assignedTo)}</td>
                    <td>{formatDate(ticket.createdAt)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleSelectTicket(ticket)}
                        aria-label={`Open ticket ${ticket.subject || ticket._id}`}
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
          aria-labelledby="ticket-details-heading"
          style={{
            marginTop: "28px",
            padding: "20px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <h2 id="ticket-details-heading">Ticket Details</h2>

          <p>
            <strong>Ticket ID:</strong> {selectedTicket._id}
          </p>

          <p>
            <strong>Subject:</strong> {selectedTicket.subject || "—"}
          </p>

          <p>
            <strong>Author ID:</strong>{" "}
            {formatReference(selectedTicket.authorId)}
          </p>

          <p>
            <strong>Book ID:</strong>{" "}
            {formatReference(selectedTicket.bookId)}
          </p>

          <p>
            <strong>Submitted:</strong>{" "}
            {formatDate(selectedTicket.createdAt)}
          </p>

          <p>
            <strong>Last updated:</strong>{" "}
            {formatDate(selectedTicket.updatedAt)}
          </p>

          <p>
            <strong>Query:</strong>
          </p>

          <p style={{ whiteSpace: "pre-wrap" }}>
            {selectedTicket.description || "No description provided."}
          </p>

          <hr />

          <h3>AI Classification — Admin Override</h3>
          <p>
            Review the ticket classification and change it if necessary.
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
              {actionLoading ? "Saving..." : "Save Category & Priority"}
            </button>
          </div>

          <hr />

          <h3>Update Status</h3>

          <label>
            Status
            <br />
            <select
              value={selectedTicket.status || "Open"}
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

          <hr />

          <h3>Assign Ticket</h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              assignTicket();
            }}
          >
            <label>
              Agent name or ID
              <br />
              <input
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Enter agent name or ID"
                maxLength={100}
                disabled={actionLoading}
              />
            </label>

            <button
              type="submit"
              disabled={actionLoading || !assignedTo.trim()}
            >
              {actionLoading ? "Processing..." : "Assign"}
            </button>
          </form>

          <hr />

          <h3>Conversation</h3>

          {selectedTicket.responses?.length ? (
            selectedTicket.responses.map((item, index) => (
              <article
                key={item._id || `${item.createdAt || "reply"}-${index}`}
                style={{
                  marginBottom: "12px",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              >
                <strong>
                  {item.senderRole === "admin" ||
                  item.senderRole === "support"
                    ? "Support"
                    : "Author"}
                </strong>

                <p style={{ whiteSpace: "pre-wrap" }}>
                  {item.message || ""}
                </p>

                <small>{formatDate(item.createdAt)}</small>
              </article>
            ))
          ) : (
            <p>No replies yet.</p>
          )}

          <hr />

          <h3>Internal Notes (Admin Only)</h3>

          {selectedTicket.internalNotes?.length ? (
            selectedTicket.internalNotes.map((item, index) => (
              <article
                key={item._id || `${item.createdAt || "note"}-${index}`}
                style={{
                  marginBottom: "12px",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                }}
              >
                <p style={{ whiteSpace: "pre-wrap" }}>
                  {item.message || ""}
                </p>

                <small>
                  {item.createdBy
                    ? `Added by ${formatReference(item.createdBy)} · `
                    : ""}
                  {formatDate(item.createdAt)}
                </small>
              </article>
            ))
          ) : (
            <p>No internal notes yet.</p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              addInternalNote();
            }}
          >
            <label>
              Add internal note
              <br />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write a note visible only to support staff"
                rows={3}
                maxLength={2000}
                required
                disabled={actionLoading}
              />
            </label>

            <br />

            <button
              type="submit"
              disabled={actionLoading || !note.trim()}
            >
              Add Internal Note
            </button>
          </form>

          <hr />

          <h3>Reply to Author</h3>

          <p>
            Generate a draft if needed, review it, and edit it before sending.
          </p>

          <button
            type="button"
            disabled={
              actionLoading || selectedTicket.status === "Closed"
            }
            onClick={generateDraft}
          >
            {actionLoading ? "Processing..." : "Generate AI Draft"}
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendReply();
            }}
          >
            <label>
              Reply message
              <br />
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write or edit your response to the author"
                rows={5}
                maxLength={5000}
                required
                disabled={actionLoading}
              />
            </label>

            <br />

            <button
              type="submit"
              disabled={
                actionLoading ||
                selectedTicket.status === "Closed" ||
                !reply.trim()
              }
            >
              {actionLoading ? "Sending..." : "Send Reply"}
            </button>
          </form>

          {selectedTicket.status === "Closed" && (
            <p>This ticket is closed, so replies are disabled.</p>
          )}

          <button
            type="button"
            onClick={handleCloseDetails}
            style={{ marginTop: "12px" }}
          >
            Close Details
          </button>
        </section>
      )}
    </main>
  );
}
