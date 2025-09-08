const Tenant = require('../models/Tenant');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerTenant = async (req, res) => {
  const { tenantName, adminName, email, password } = req.body;
  if (!tenantName || !adminName || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  try {
    
    const tenant = new Tenant({ name: tenantName });
    await tenant.save();

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      tenant: tenant._id,
      name: adminName,
      email,
      password: hashed,
      role: 'admin'
    });
    await user.save();

    const token = jwt.sign({ id: user._id, tenant: tenant._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, tenant: { id: tenant._id, name: tenant.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// exports.login = async (req, res) => {
//   const { email, password, tenantName } = req.body;
//   if (!email || !password || !tenantName) return res.status(400).json({ message: 'Missing fields' });
//   try {
//     const tenant = await Tenant.findOne({ name: tenantName });
//     if (!tenant) return res.status(400).json({ message: 'Tenant not found' });
//     const user = await User.findOne({ email: email.toLowerCase(), tenant: tenant._id });
//     if (!user) return res.status(400).json({ message: 'User not found' });
//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
//     const token = jwt.sign({ id: user._id,role:tenant.role, tenant: tenant._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
//     res.json({ token, tenant: { id: tenant._id, name: tenant.name }, user: { id: user._id, name: user.name, role: user.role } });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

exports.login = async (req, res) => {
  const { email, password, tenantName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    let user;
    let tenant = null;
    user = await User.findOne({ email: email.toLowerCase(), role: "superadmin" });
    if (user) {
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      console.log("superadmin user",user)
      return res.json({
        token,
        user: { id: user._id, name: user.name, role: user.role },
      });
    }

    if (!tenantName) {
      return res.status(400).json({ message: "Tenant name is required" });
    }

    tenant = await Tenant.findOne({ name: tenantName });
    if (!tenant) return res.status(400).json({ message: "Tenant not found" });

    user = await User.findOne({ email: email.toLowerCase(), tenant: tenant._id });
    if (!user) return res.status(400).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });
    console.log("normal user",user)
    const token = jwt.sign(
      { id: user._id, role: user.role, tenant: tenant._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      tenant: { id: tenant._id, name: tenant.name },
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
