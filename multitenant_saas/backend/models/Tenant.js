
const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  domain: { type: String },
  plan: { 
    type: String, 
    enum: ['free', 'basic', 'pro', 'enterprise'], 
    default: 'free' 
  },

  status: { 
    type: String, 
    enum: ['active', 'suspended', 'deleted'], 
    default: 'active' 
  },
  
  usage: {
    users: { type: Number, default: 0 },         
    apiCalls: { type: Number, default: 0 },       
    storage: { type: Number, default: 0 }         
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tenant', TenantSchema);
