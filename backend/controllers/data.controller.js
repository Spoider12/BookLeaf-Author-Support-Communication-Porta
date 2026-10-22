
const sampleData = require("../data/bookleaf_sample_data.json");

const getAuthors = (req, res) => {
  res.status(200).json({
    success: true,
    count: sampleData.authors.length,
    authors: sampleData.authors,
  });
};

const getBooks = (req, res) => {
  const books = sampleData.authors.flatMap((author) =>
    author.books.map((book) => ({
      ...book,
      author_id: author.author_id,
      author_name: author.name,
    }))
  );

  res.status(200).json({
    success: true,
    count: books.length,
    books,
  });
};

module.exports = { getAuthors, getBooks };
