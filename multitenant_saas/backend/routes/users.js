const router = require('express').Router();
const userController = require('../controllers/userController');
const {auth,requireRole} = require('../middleware/auth');
const User=require("../models/User")

router.get('/me', auth, userController.getMyProfile);
router.get('/', auth, async (req, res) => {
  try {
    
    const search = req.query.q || ""; 
    const regex = new RegExp(search, 'i');

    const users = await User.find({
      tenant: req.user.tenant._id,
      $or: [
        { name: regex },
        { email: regex }
      ]
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/', auth, userController.listUsers);
router.get("/status",auth,userController.getUserStatus)

router.get('/:id', auth, userController.getUserById)
router.post('/', auth, requireRole("admin"),userController.createUser);
router.delete('/:id', auth, requireRole('admin'), userController.deleteUser);
router.put('/:id', auth, requireRole('admin'), userController.updateUser);
router.post('/reset-password-request', userController.resetPasswordRequest);
router.post('/reset-password/:token', userController.resetPassword);





module.exports = router;
