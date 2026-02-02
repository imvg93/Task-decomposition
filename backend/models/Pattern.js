const mongoose = require('mongoose');

const TaskSubdocumentSchema = new mongoose.Schema(
  {
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
    category: {
      type: String,
    },
    dependencies: [
      {
        type: String,
      },
    ],
  },
  {
    _id: false,
  }
);

const PatternSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      required: true,
    },
    tasks: [TaskSubdocumentSchema],
    implicitDependencies: {
      type: Map,
      of: [String],
    },
  },
  {
    timestamps: true,
  }
);

const Pattern = mongoose.model('Pattern', PatternSchema);

module.exports = Pattern;

