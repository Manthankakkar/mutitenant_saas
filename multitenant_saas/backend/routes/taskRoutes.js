const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { auth} = require('../middleware/auth');
const upload=require("../middleware/upload")

router.post('/', auth, taskController.createTask);
router.get('/', auth, taskController.getTasks);
router.put('/:id', auth, taskController.updateTask);
router.delete('/:id',auth, taskController.deleteTask);
router.post('/:id/upload', auth, upload.single('file'), taskController.uploadFile);

module.exports = router;
