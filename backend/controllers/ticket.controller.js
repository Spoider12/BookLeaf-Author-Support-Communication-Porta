
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
    const { bookId, category, subject, description, attachment } = req.body;

    if (!subject?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Subject and description are required.",
      });
    }

    // Get author ID from the authenticated user's token
    const authorId = req.user.author_id;

    // Verify that the selected book belongs to this author
    if (bookId) {
      const book = await Book.findOne({
        book_id: bookId,
        author_id: authorId,
      });

      if (!book) {
        return res.status(400).json({
          success: false,
          message: "Book not found or does not belong to you.",
        });
      }
    }

    const ticket = await Ticket.create({
      authorId,
      bookId: bookId || null,
      category: category || "General Inquiry",
      subject: subject.trim(),
      description: description.trim(),
      attachment: attachment || null,
    });

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully.",
      ticket,
    });
  } catch (error) {
    console.error("Create ticket error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create ticket.",
    });
  }
};


// PATCH /api/tickets/:ticketId/status
// Admin only: update ticket status
const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Open",
      "In Progress",
      "Resolved",
      "Closed",
    ];

    if (!mongoose.isValidObjectId(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Choose Open, In Progress, Resolved, or Closed.",
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ticket status updated successfully.",
      ticket,
    });
  } catch (error) {
    console.error("Update ticket status error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update ticket status.",
    });
  }
};


module.exports = { getTickets, createTicket, updateTicketStatus };
