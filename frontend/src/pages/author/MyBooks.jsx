
import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function MyBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/books", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setBooks(response.data.books || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load your books."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) return <p>Loading your books...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <div>
      <h1>My Books</h1>

      {books.length === 0 ? (
        <p>No books found for your account.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>ISBN</th>
                <th>Genre</th>
                <th>Publication Date</th>
                <th>Status</th>
                <th>MRP</th>
                <th>Copies Sold</th>
                <th>Total Royalty Earned</th>
                <th>Royalty Paid</th>
                <th>Royalty Pending</th>
              </tr>
            </thead>

            <tbody>
              {books.map((book) => (
                <tr key={book.book_id}>
                  <td>{book.title || "—"}</td>
                  <td>{book.isbn || "—"}</td>
                  <td>{book.genre || "—"}</td>
                  <td>
                    {book.publication_date
                      ? new Date(book.publication_date).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>{book.status || "—"}</td>
                  <td>{book.mrp ?? "—"}</td>
                  <td>{book.total_copies_sold ?? "—"}</td>
                  <td>{book.total_royalty_earned ?? "—"}</td>
                  <td>{book.royalty_paid ?? "—"}</td>
                  <td>{book.royalty_pending ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
