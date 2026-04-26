const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    taskName: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  // Automatically adds createdAt and updatedAt);
  { timestamps: true },
);

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
