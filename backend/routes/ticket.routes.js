
const express = require("express");
const { getTickets ,createTicket ,updateTicketStatus } = require("../controllers/ticket.controller");
const {
  protect,
  authorize,
} = require("../middleware/auth.middleware");

const router = express.Router();

// All ticket routes require authentication
router.use(protect);
router.patch(
  "/:ticketId/status",
  authorize("admin"),
  updateTicketStatus
);
// Authors and admins can create tickets
router.post("/", createTicket);
// Admin-only: view all tickets
router.get("/", authorize("admin"), getTickets);

module.exports = router;
