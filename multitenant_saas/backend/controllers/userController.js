const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto=require("crypto")
const SibApiV3Sdk=require("sib-api-v3-sdk")
require("dotenv").config()

exports.getMyProfile = async (req, res) => {
  const user = req.user;
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role, tenant: user.tenant });
};

exports.listUsers = async (req, res) => {
  const tenantId = req.user.tenant._id;
  const users = await User.find({ tenant: tenantId }).select('-password');
  res.json(users);
};

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
  const tenantId = req.user.tenant._id;
  const bcrypt = require('bcryptjs');
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = new User({ tenant: tenantId, name, email: email.toLowerCase(), password: hashed, role: role || 'member' });
    await user.save();
    res.json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};





exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password, role } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role=="admin"){
      if (name) user.name = name;
    if (email) user.email = email;
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    return res.json({ message: "User updated successfully", user });

    }

    
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
     

   
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    return res.json({ message: "User updated successfully", user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};





exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

  
    const user = await User.findById(userId).select('-password').populate('tenant');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};





exports.resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("user is ",user)


    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    const resetLink = `http://localhost:5000/resetPassword.html?token=${resetToken}&email=${email}`;


    const client = SibApiV3Sdk.ApiClient.instance;
    client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

//     const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
//       to: [{ email: user.email}],
//       sender: { email: "manthankakkar05@gmail.com", name: "Multitenant_saas" },
//       subject: "Password Reset Request",
//       htmlContent: `<p>Hello ${user.name},</p>
//                     <p>Click <a href="${resetLink}">here</a> to reset your password. This link is valid for 1 hour.</p>`
//     });

//     await apiInstance.sendTransacEmail(sendSmtpEmail);

//     res.json({ message: "Password reset link sent to your email" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

 const sendSmtpEmailInput = {
            sender: { name: 'Multitenant_saas', email: 'manthankakkar05@gmail.com' },
            to: [{ email: email }],
            subject: 'Password Reset Request',
            htmlContent: `<p>You requested a password reset. Click the link below to reset your password:</p>
                          <a href="${resetLink}">Reset Password</a>
                          <p>This link will expire in 1 hour.
                          </p>`
        };

        await apiInstance.sendTransacEmail(sendSmtpEmailInput);

        return res.status(200).json({ message: "Password reset email sent successfully" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
};


  

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    console.log("reset user is",user)

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });
    console.log("old user is",user)

    hashedpassword=await bcrypt.hash(password, 10)
    user.password = hashedpassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    console.log("updated user is",user)
    

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getUserStatus = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ isPremium: user.isPremium });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


