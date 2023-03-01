const mongoose = require("mongoose");
const message = require("../utils/message");

const commentsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  comment: {
    type: String,
    required: [true, "the comment should not be empty"],
    minLength: [1, message.numOfCharacters("comment", 1)],
    trim: true,
  },
  task: {
    type: mongoose.Schema.ObjectId,
    ref: "Task",
  },
});

const Comment = mongoose.model("Comment", commentsSchema);

module.exports = Comment;
