const Task = require('../models/Task');
const Action = require('../models/Action');
const User = require('../models/User');

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedUser', 'username');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTask = async (req, res, io) => {
  const { title, description, priority } = req.body;
  if (['Todo', 'In Progress', 'Done'].includes(title)) {
    return res.status(400).json({ error: 'Task title cannot match column names' });
  }
  try {
    const task = new Task({ title, description, priority });
    await task.save();
    const action = new Action({ user: req.user.id, action: `Created task: ${title}`, taskId: task._id });
    await action.save();
    io.emit('taskUpdate', task);
    io.emit('actionUpdate', action);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateTask = async (req, res, io) => {
  const { id } = req.params;
  const { title, description, assignedUser, status, priority, version } = req.body;
  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (task.version > version) {
      return res.status(409).json({ error: 'Conflict detected', currentTask: task });
    }
    task.title = title || task.title;
    task.description = description || task.description;
    task.assignedUser = assignedUser || task.assignedUser;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.version += 1;
    task.lastModified = Date.now();
    await task.save();
    const action = new Action({ user: req.user.id, action: `Updated task: ${task.title}`, taskId: task._id });
    await action.save();
    io.emit('taskUpdate', task);
    io.emit('actionUpdate', action);
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.smartAssign = async (req, res, io) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const users = await User.find();
    let minTasks = Infinity;
    let assignedUser = null;
    for (const user of users) {
      const taskCount = await Task.countDocuments({ assignedUser: user._id, status: { $in: ['Todo', 'In Progress'] } });
      if (taskCount < minTasks) {
        minTasks = taskCount;
        assignedUser = user._id;
      }
    }
    task.assignedUser = assignedUser;
    task.version += 1;
    task.lastModified = Date.now();
    await task.save();
    const action = new Action({ user: req.user.id, action: `Smart assigned task: ${task.title}`, taskId: task._id });
    await action.save();
    io.emit('taskUpdate', task);
    io.emit('actionUpdate', action);
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res, io) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await task.remove();
    const action = new Action({ user: req.user.id, action: `Deleted task: ${task.title}`, taskId: task._id });
    await action.save();
    io.emit('taskUpdate', { _id: id, deleted: true });
    io.emit('actionUpdate', action);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};