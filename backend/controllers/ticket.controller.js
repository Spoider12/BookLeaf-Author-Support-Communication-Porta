
const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");

const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Get tickets error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tickets",
    });
  }
};

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
        message: "Author ID, subject and description are required",
      });
    }

    // Validate MongoDB IDs
    if (!mongoose.isValidObjectId(authorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid author ID",
      });
    }

    if (bookId && !mongoose.isValidObjectId(bookId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    // Validate input lengths
    if (subject.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: "Subject cannot exceed 150 characters",
      });
    }

    if (description.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 5000 characters",
      });
    }

    const ticket = await Ticket.create({
      author: authorId,
      book: bookId || null,
      category: category || "General Inquiry",
      subject: subject.trim(),
      description: description.trim(),
      attachment: attachment || null,
    });

    return res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
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
      message: "Failed to create support ticket",
    });
  }
};

module.exports = {
  getTickets,
  createTicket,
};
