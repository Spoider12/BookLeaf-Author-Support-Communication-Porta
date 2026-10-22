
const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      default: null,
    },

    category: {
      type: String,
      enum: [
        "Royalty & Payments",
        "ISBN & Metadata Issues",
        "Printing & Quality",
        "Distribution & Availability",
        "Book Status & Production Updates",
        "General Inquiry",
        "General",
        "Account Level",
      ],
      default: "General Inquiry",
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    priority: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },

    attachment: {
      type: String,
      default: null,
    },

    responses: [
      {
        message: { type: String, required: true },
        senderRole: {
          type: String,
          enum: ["author", "admin"],
          required: true,
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    internalNotes: [
      {
        message: { type: String, required: true },
        admin: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
