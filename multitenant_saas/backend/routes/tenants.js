const router = require('express').Router();
const Tenant = require('../models/Tenant');
const {usageTracker}=require("../middleware/auth")

router.get('/',async (req, res) => {
  const tenants = await Tenant.find().limit(50);
  res.json(tenants);
});



module.exports = router;
