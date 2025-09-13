const router = require('express').Router();
const Tenant = require('../models/Tenant');
const {auth,usageTracker}=require("../middleware/auth")

const {updateCustomization}=require("../controllers/customizationController")
router.get('/',async (req, res) => {
  const tenants = await Tenant.find().limit(50);
  res.json(tenants);
});



router.put('/customize', auth,updateCustomization);
router.get("/customization", auth, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenant._id);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    res.json({
      branding: tenant.branding,
      theme: tenant.theme
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});






module.exports = router;
