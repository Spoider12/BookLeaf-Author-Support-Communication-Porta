
const express = require("express");

const {
  register,
  login,
} = require("../controllers/auth.controller");

const router = express.Router();

// Register a new author
router.post("/register", register);

// Log in an existing author or admin
router.post("/login", login);

module.exports = router;
