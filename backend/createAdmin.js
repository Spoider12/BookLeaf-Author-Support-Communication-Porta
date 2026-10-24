require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = process.env.ADMIN_SETUP_EMAIL;
    const password = process.env.ADMIN_SETUP_PASSWORD;

    if (!password || password.length < 12) {
      throw new Error(
        "Set ADMIN_SETUP_PASSWORD to a password of at least 12 characters."
      );
    }

    let admin = await User.findOne({ email });

    if (admin) {
      admin.role = "admin";
      admin.passwordHash = await bcrypt.hash(password, 12);
      await admin.save();
    } else {
      admin = await User.create({
        author_id: "ADMIN001",
        name: "BookLeaf Admin",
        email,
        role: "admin",
        passwordHash: await bcrypt.hash(password, 12),
      });
    }

    console.log("Admin account created/updated successfully.");
    console.log("Email:", email);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();