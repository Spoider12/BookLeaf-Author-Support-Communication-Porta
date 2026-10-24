
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify whether the user is authenticated
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      author_id: decoded.author_id,
    }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User associated with this token was not found.",
      });
    }

    req.user = {
      id: user._id,
      author_id: user.author_id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};

// Restrict access according to user role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
