const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { auth,isSuperAdmin } = require('../middleware/auth'); 

router.get('/tenants', auth,superAdminController.getAllTenants);
router.get('/tenants/:id', auth, superAdminController.getTenantById);
router.put('/tenants/:id/plan', auth, superAdminController.updateTenantPlan);
router.put('/tenants/:id/status',auth , superAdminController.updateTenantStatus);
router.delete('/tenants/:id',auth,superAdminController.deleteTenant);

module.exports = router;
