const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin','admin','member'], default: 'member' },
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    required: function () {
      return this.role !== "superadmin";
    }},
  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: { type: String },
resetPasswordExpires: { type: Date },
});

UserSchema.index({ email: 1, tenant: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
