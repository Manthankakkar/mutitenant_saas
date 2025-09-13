const Tenant = require('../models/Tenant');


exports.updateCustomization = async (req, res) => {
  try {
    const user = req.user; 
    console.log("user is ", user)
    const { logoUrl, primaryColor, secondaryColor, theme } = req.body;

    
    const tenant = await Tenant.findById(user.tenant._id);

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    if (logoUrl !== undefined) tenant.branding.logoUrl = logoUrl;
    if (primaryColor !== undefined) tenant.branding.primaryColor = primaryColor;
    if (secondaryColor !== undefined) tenant.branding.secondaryColor = secondaryColor;
    if (theme !== undefined) tenant.theme = theme;

    await tenant.save();

    res.json({ message: "Customization updated successfully", tenant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

