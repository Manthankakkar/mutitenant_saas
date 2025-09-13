const User = require("../models/User");

const isPremium = async (req, res, next) => {
  try {
    const userId = req.user.id; 
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  if (user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can start video calls" });
    }
    if (!user.isPremium) {
      return res.status(403).json({ message: "Premium membership required" });
    }

    next(); 
  } catch (err) {
    console.error("Error in isPremium middleware:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = isPremium;
