const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');
const Tenant = require('../models/Tenant');
dotenv.config();

async function auth(req, res, next) {
  const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('tenant');
    if (!user) return res.status(401).json({ message: 'Invalid token (no user)' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}


function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}


function isSuperAdmin(req, res, next) {
  if (req.user && req.user.role === "superadmin") {
    return next();
  }
  return res.status(403).json({ message: "Forbidden: Super Admins only" });
}




async function usageTracker(req, res, next) {
  try {
    
    const tenantId = req.user?.tenantId || req.tenant?._id;

    if (!tenantId) {
      return next(); 
    }

    await Tenant.findByIdAndUpdate(
      tenantId,
      { $inc: { "usage.apiCalls": 1 } }, 
      { new: true }
    );

    next();
  } catch (err) {
    console.error("Usage tracker error:", err);
    next(); 
  }
}



module.exports = { auth, requireRole ,isSuperAdmin,usageTracker};




