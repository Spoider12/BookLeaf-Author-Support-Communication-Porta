
const mongoose = require("mongoose");

const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Book = require("../models/Book");

// GET /api/tickets
const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Get tickets error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tickets.",
    });
  }
};

// POST /api/tickets
const createTicket = async (req, res) => {
  try {
    const {
      authorId,
      bookId,
      category,
      subject,
      description,
      attachment,
    } = req.body;

    // Validate required fields
    if (!authorId || !subject?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "authorId, subject, and description are required.",
      });
    }

    // Verify author exists
    const author = await User.findOne({ author_id: authorId });

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Author not found. Check the authorId.",
      });
    }

    // Verify the optional book belongs to this author
    if (bookId) {
      const book = await Book.findOne({
        book_id: bookId,
        author_id: authorId,
      });

      if (!book) {
        return res.status(400).json({
          success: false,
          message: "Book not found or does not belong to this author.",
        });
      }
    }

    const ticket = await Ticket.create({
      authorId,
      bookId: bookId || null,
      category: category || "General Inquiry",
      subject,
      description,
      attachment: attachment || null,
    });

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully.",
      ticket,
    });
  } catch (error) {
    console.error("Create ticket error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create ticket.",
    });
  }
};

module.exports = { getTickets, createTicket };
