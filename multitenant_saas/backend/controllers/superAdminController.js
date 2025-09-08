const Tenant = require('../models/Tenant');


exports.getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find();
    res.status(200).json(tenants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });
    res.status(200).json(tenant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateTenantPlan = async (req, res) => {
  try {
    const { plan } = req.body;
    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { plan },
      { new: true }
    );
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });
    res.status(200).json({ message: "Tenant plan updated", tenant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateTenantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const tenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });
    res.status(200).json({ message: "Tenant status updated", tenant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);
    console.log("tenant is",tenant)
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });
    res.status(200).json({ message: "Tenant deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
