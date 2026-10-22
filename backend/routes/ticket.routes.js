
const express = require("express");
const { getTickets ,createTicket } = require("../controllers/ticket.controller");

const router = express.Router();

router.get("/", getTickets);
router.post("/", createTicket);

module.exports = router;
