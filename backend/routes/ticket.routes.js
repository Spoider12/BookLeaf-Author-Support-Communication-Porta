
const express = require("express");
const { getTickets ,
  createTicket ,
  updateTicketStatus ,
  assignTicket,
  addInternalNote,
  addTicketReply,
  generateTicketReplyDraft,
  updateTicketClassification
   } = require("../controllers/ticket.controller");
const {
  protect,
  authorize,
} = require("../middleware/auth.middleware");

const router = express.Router();

// All ticket routes require authentication
router.use(protect);


router.patch(
  "/:ticketId/classification",
  authorize("admin"),
  updateTicketClassification
);


router.post(
  "/:ticketId/ai-draft",
  authorize("admin"),
  generateTicketReplyDraft
);
// Ticket Replies
router.post(
  "/:ticketId/replies",
  authorize("author", "admin"),
  addTicketReply
);
//Assigning Ticket to the Support Agent
router.patch(
  "/:ticketId/assign",
  authorize("admin"),
  assignTicket
);
// Add some private Note which is hidden by the user 
router.post(
  "/:ticketId/internal-notes",
  authorize("admin"),
  addInternalNote
);

router.patch(
  "/:ticketId/status",
  authorize("admin"),
  updateTicketStatus
);
// Authors and admins can create tickets
router.post("/", createTicket);
// Admin-only: view all tickets
router.get("/", authorize("admin","author"), getTickets);

module.exports = router;
