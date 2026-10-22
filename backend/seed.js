
require("dotenv").config();

const mongoose = require("mongoose");
const sampleData = require("./data/bookleaf_sample_data.json");
const User = require("./models/User");
const Book = require("./models/Book");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    

    for (const author of sampleData.authors) {
      const { books, ...authorDetails } = author;

      await User.updateOne(
        { author_id: author.author_id },
        {
          $set: {
            ...authorDetails,
            role: "author",
          },
        },
        { upsert: true, runValidators: true }
      );

      for (const book of books) {
        await Book.updateOne(
          { book_id: book.book_id },
          {
            $set: {
              ...book,
              author_id: author.author_id,
            },
          },
          { upsert: true, runValidators: true }
        );
      }
    }
    
    console.log("Authors and books seeded successfully!");
    console.log(`Authors processed: ${sampleData.authors.length}`);
    console.log(
      `Books processed: ${sampleData.authors.reduce(
        (total, author) => total + author.books.length,
        0
      )}`
    );
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
