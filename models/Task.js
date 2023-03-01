const mongoose = require("mongoose");
const { numOfCharacters, requireness } = require("../utils/message");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      minLength: [2, numOfCharacters("title", 2)],
      required: [true, requireness("title")],
    },
    description: {
      type: String,
      minLength: [2, numOfCharacters("name", 2)],
    },
    priority: {
      type: String,
      required: [true, requireness("priority")],
      lowercase: true,
      enum: {
        values: ["high", "medium", "low", "urgent", "normal", "critical"],
        message:
          "Priority must be one of the following values: High, Medium, Low, Urgent, Normal, Critical.",
      },
      default: "urgent",
    },
    status: {
      type: String,
      default: "open",
      lowercase: true,
      enum: {
        values: ["open", "in progress", "completed", "cancelled", "on hold"],
        message:
          "Status must be one of the following values: Open, In Progress, Completed, Cancelled, On hold",
      },
    },
    // creator: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: "User",
    // },
    assignee: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    dueDate: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

// virtual populating
taskSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "task",
  localField: "_id",
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
