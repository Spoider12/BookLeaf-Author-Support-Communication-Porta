
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    author_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: String,
    city: String,
    joined_date: Date,
    role: {
      type: String,
      enum: ["author", "admin"],
      default: "author",
    },
    passwordHash: {
      type: String,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
