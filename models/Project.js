const mongoose = require("mongoose");
const { numOfCharacters, requireness } = require("../utils/message");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minLength: [2, numOfCharacters("name", 2)],
      required: [true, requireness("name")],
    },
    description: {
      type: String,
      required: [true, requireness("description")],
      minLength: [2, numOfCharacters("name", 2)],
    },
    tasks: {
      type: [mongoose.Schema.ObjectId],
      ref: "Task",
      default: [],
    },
    members: {
      type: [mongoose.Schema.ObjectId],
      ref: "User",
      default: [],
    },
    creator: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    endDate: Date,
    completion: Number,
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
