
const express = require("express");
const {
  getAuthors,
  getBooks,
} = require("../controllers/data.controller");

const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/authors", getAuthors);
router.get("/books", protect ,authorize("author"),getBooks);

module.exports = router;
