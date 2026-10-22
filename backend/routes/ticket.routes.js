
const express = require("express");
const { getTickets } = require("../controllers/ticket.controller");

const router = express.Router();

router.get("/", getTickets);

module.exports = router;
