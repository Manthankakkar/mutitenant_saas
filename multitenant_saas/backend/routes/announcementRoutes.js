const express = require("express");
const router = express.Router();
const Announcement = require("../models/announcement");
const {auth} = require("../middleware/auth"); 


router.get("/:tenantId", auth, async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const announcements = await Announcement.find({ tenant: tenantId })
      .sort({ createdAt: 1 });

    res.json(announcements);
  } catch (err) {
    console.error("Error fetching announcements:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
