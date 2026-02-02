const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    estimatedHours: {
      type: Number,
      default: 0,
    },
    priority: {
      type: Number,
      default: 1,
    },
    dependencies: [
      {
        type: String,
      },
    ],
    category: {
      type: String,
    },
    ambiguityFlags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;

