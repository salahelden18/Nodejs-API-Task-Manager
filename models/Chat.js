const mongoose = require("mongoose");
const { requireness } = require("../utils/message");

const chatSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.ObjectId,
      ref: "Project",
      required: [true, requireness("project")],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, requireness("user")],
    },
    message: {
      type: String,
      trim: true,
      required: [true, requireness("message")],
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
