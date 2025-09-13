const Task = require('../models/task');


exports.createTask = async (req, res) => {
  try {
      const { title, description, deadline, assignedTo,priority } = req.body;
      console.log("req body is",req.body)

    const task = new Task({
      tenant: req.user.tenant._id,
      createdBy: req.user._id,
      title,
      description,
      priority,
      deadline,
      assignedTo,
      
    });

    await task.save();
    res.json({ message: 'Task created', task });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ tenant: req.user.tenant._id })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, tenant: req.user.tenant._id },
      req.body,
      { new: true }
    );
    res.json({ message: 'Task updated', task });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, tenant: req.user.tenant._id });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};



const path = require('path');

exports.uploadFile = async (req, res) => {
  try {
    const taskId = req.params.id;

    
    const task = await Task.findOne({ _id: taskId, tenant: req.user.tenant._id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`; 
    const fileName = req.file.originalname;

    task.attachments.push({ fileUrl, fileName });
    await task.save();

    res.json({ message: "File uploaded", file: { fileUrl, fileName }, task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
