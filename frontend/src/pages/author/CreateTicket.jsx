
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function CreateTicket() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [bookId, setBookId] = useState("");
  const [category, setCategory] = useState("General Inquiry");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await api.get("/books", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setBooks(response.data.books || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load your books."
        );
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!subject.trim() || !description.trim()) {
      setError("Subject and description are required.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        bookId: category === "General Inquiry" ? null : bookId || null,
        category,
        subject: subject.trim(),
        description: description.trim(),
      };

      if (category !== "General Inquiry" && !bookId) {
        setError("Please select a book or choose General Inquiry.");
        setSubmitting(false);
        return;
      }

      await api.post("/tickets", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setSuccess("Your support ticket has been submitted.");
      setBookId("");
      setCategory("General Inquiry");
      setSubject("");
      setDescription("");

      setTimeout(() => navigate("/author/tickets"), 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit your ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Submit a Support Ticket</h1>
      <p>Contact BookLeaf support about your books or account.</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="category">Query type</label>
          <select
            id="category"
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setBookId("");
            }}
          >
            <option value="General Inquiry">General / Account Level</option>
            <option value="Book Related">Book Related</option>
          </select>
        </div>

        {category !== "General Inquiry" && (
          <div>
            <label htmlFor="book">Select book</label>
            <select
              id="book"
              value={bookId}
              onChange={(event) => setBookId(event.target.value)}
              disabled={loadingBooks}
            >
              <option value="">
                {loadingBooks ? "Loading books..." : "Choose a book"}
              </option>

              {books.map((book) => (
                <option key={book.book_id} value={book.book_id}>
                  {book.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            required
            maxLength={200}
            placeholder="Enter your query subject"
          />
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            rows={6}
            maxLength={5000}
            placeholder="Describe your issue in detail"
          />
        </div>

        {error && <p role="alert">{error}</p>}
        {success && <p role="status">{success}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>
    </div>
  );
}
