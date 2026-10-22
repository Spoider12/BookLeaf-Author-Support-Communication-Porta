
const express = require("express");
const {
  getAuthors,
  getBooks,
} = require("../controllers/data.controller");

const router = express.Router();

router.get("/authors", getAuthors);
router.get("/books", getBooks);

module.exports = router;
