
const mongoose = require("mongoose");

const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Book = require("../models/Book");
const { classifyTicket, generateReplyDraft } = require("../services/ai.service");

// GET /api/tickets

const getTickets = async (req, res) => {
  try {
    const { status, category, priority, from, to } = req.query;

    const filter = {};

    const allowedStatuses = [
      "Open",
      "In Progress",
      "Resolved",
      "Closed",
    ];

    const allowedPriorities = [
      "Critical",
      "High",
      "Medium",
      "Low",
    ];

    if (status) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status filter.",
        });
      }
      filter.status = status;
    }

    if (priority) {
      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid priority filter.",
        });
      }
      filter.priority = priority;
    }

    if (category) {
      filter.category = category;
    }

    if (from || to) {
      filter.createdAt = {};

      if (from) {
        const startDate = new Date(from);

        if (Number.isNaN(startDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid start date.",
          });
        }

        filter.createdAt.$gte = startDate; 
      }

      if (to) {
        const endDate = new Date(to);

        if (Number.isNaN(endDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid end date.",
          });
        }

        endDate.setUTCHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

          if (req.user.role === "author") {
            filter.authorId = req.user.author_id;
          }

      let query = Ticket.find(filter).sort({ createdAt: -1 });

      if (req.user.role === "author") {
        query = query.select("-internalNotes");
      }

      const tickets = await query;

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Get tickets error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tickets.",
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
        let aiClassification = {
          category: "General Inquiry",
          priority: "Medium",
          reason: "AI classification was unavailable.",
        };

          try {
            aiClassification = await classifyTicket({
              subject,
              description,
            });
          } catch (error) {
            console.error("Ticket AI classification failed:", error.message);
          }

    const ticket = await Ticket.create({
      authorId,
      bookId: bookId || null,
      category: category || "General Inquiry",
      subject: subject.trim(),
      description: description.trim(),
      attachment: attachment || null,
      category: aiClassification.category,
      priority: aiClassification.priority,
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

const assignTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { assignedTo } = req.body;

    if (!mongoose.isValidObjectId(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    if (typeof assignedTo !== "string" || !assignedTo.trim()) {
      return res.status(400).json({
        success: false,
        message: "Assigned agent name or ID is required.",
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { $set: { assignedTo: assignedTo.trim() } },
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
      message: "Ticket assigned successfully.",
      ticket,
    });
  } catch (error) {
    console.error("Assign ticket error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to assign ticket.",
    });
  }
};

const addInternalNote = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!mongoose.isValidObjectId(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.trim().length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Note must be between 1 and 2000 characters.",
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      {
        $push: {
          internalNotes: {
            message: message.trim(),
            adminId: req.user.author_id,
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Internal note added successfully.",
      ticket,
    });
  } catch (error) {
    console.error("Add internal note error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add internal note.",
    });
  }
};

const addTicketReply = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!mongoose.isValidObjectId(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.trim().length > 5000
    ) {
      return res.status(400).json({
        success: false,
        message: "Reply must be between 1 and 5000 characters.",
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    // Authors can reply only to their own tickets.
    if (
      req.user.role === "author" &&
      ticket.authorId !== req.user.author_id
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot reply to another author's ticket.",
      });
    }

    if (ticket.status === "Closed") {
      return res.status(400).json({
        success: false,
        message: "This ticket is closed and cannot receive replies.",
      });
    }

    ticket.responses.push({
      message: message.trim(),
      senderRole: req.user.role,
      createdAt: new Date(),
    });

    await ticket.save();

    return res.status(201).json({
      success: true,
      message: "Reply added successfully.",
      responses: ticket.responses,
    });
  } catch (error) {
    console.error("Add ticket reply error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add reply.",
    });
  }
};

const generateTicketReplyDraft = async (req, res) => {
  try {
    const { ticketId } = req.params;

    if (!mongoose.isValidObjectId(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    const draft = await generateReplyDraft({
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
    });

    return res.status(200).json({
      success: true,
      draft,
    });
  } catch (error) {
    console.error("Generate AI reply draft error:", error.message);

    return res.status(503).json({
      success: false,
      message:
        "AI reply draft is currently unavailable. Please write the reply manually.",
    });
  }
};





module.exports = { getTickets, createTicket, updateTicketStatus,assignTicket,addInternalNote ,addTicketReply,generateTicketReplyDraft };
