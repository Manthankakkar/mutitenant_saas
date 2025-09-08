const router = require('express').Router();
const userController = require('../controllers/userController');
const {auth,requireRole} = require('../middleware/auth');

router.get('/me', auth, userController.getMyProfile);
router.get('/', auth, userController.listUsers);
router.get('/:id', auth, userController.getUserById)
router.post('/', auth, requireRole("admin"),userController.createUser);
router.delete('/:id', auth, requireRole('admin'), userController.deleteUser);
router.put('/:id', auth, requireRole('admin'), userController.updateUser);
router.post('/reset-password-request', userController.resetPasswordRequest);
router.post('/reset-password/:token', userController.resetPassword);



module.exports = router;
