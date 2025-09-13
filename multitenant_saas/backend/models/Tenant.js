
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

 
  branding: {
    logoUrl: { type: String, default: '' }, 
    primaryColor: { type: String, default: '#6c63ff' }, 
    secondaryColor: { type: String, default: '#f5f5f5' }
  },

 
  theme: { 
    type: String, 
    enum: ['light', 'dark'], 
    default: 'light' 
  },

  createdAt: { type: Date, default: Date.now },
 
});

module.exports = mongoose.model('Tenant', TenantSchema);


