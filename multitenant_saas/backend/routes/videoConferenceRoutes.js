const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const isPremium= require("../middleware/premiumUser");

router.post("/start-call", auth, (req, res) => {
 
  res.json({ message: "Video call started successfully" });
});


router.post("/join-call", auth, (req, res) => {
  res.json({ message: "User joined the call" });
});

module.exports = router;
