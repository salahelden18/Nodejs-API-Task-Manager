const AppError = require("../utils/AppError");
const Comment = require("../models/Comment");
const Project = require("../models/Project");
const Task = require("../models/Task");
const catchAsync = require("../utils/catch_async");
const { succOrFail } = require("../utils/message");

exports.addComment = catchAsync(async (req, res, next) => {
  const { projectId, taskId } = req.params;
  const { comment } = req.body;

  if (!comment) {
    return next(new AppError("You have to add comment", 400));
  }

  const response = await Promise.all([
    Project.findById(projectId),
    Task.findById(taskId),
  ]);

  const project = response[0];

  const task = response[1];

  if (!project || !task || !project.tasks.includes(taskId)) {
    return next(new AppError("Invalid project or task ID provided", 400));
  }

  // check if the user id admin or member of the group
  if (
    project.creator.equals(req.user.id) ||
    project.members.includes(req.user.id)
  ) {
    const createdComment = await Comment.create({
      user: req.user.id,
      comment,
      task: taskId,
    });

    res.status(201).json({
      status: succOrFail(1),
      data: {
        data: createdComment,
      },
    });
  } else {
    return next(
      new AppError("You don't have permission to comment in this task", 401)
    );
  }
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const { projectId, taskId, commentId } = req.params;
  const { comment } = req.body;

  if (!comment) {
    return next(new AppError("You have to add comment", 400));
  }

  const response = await Promise.all([
    Project.findById(projectId),
    Task.findById(taskId),
    Comment.findById(commentId),
  ]);

  const project = response[0];

  const task = response[1];

  const fetchedComment = response[2];

  if (!project || !task || !project.tasks.includes(taskId) || !fetchedComment) {
    return next(
      new AppError("Invalid project or task ID of comment Id provided", 400)
    );
  }

  if (!fetchedComment.user.equals(req.user.id)) {
    return next(new AppError("only the comment owner can update it", 400));
  }

  fetchedComment.comment = comment || fetchedComment.comment;
  await fetchedComment.save({ validateModifiedOnly: true });

  res.status(200).json({
    status: succOrFail(1),
    data: {
      data: fetchedComment,
    },
  });
});

exports.getComment = catchAsync(async (req, res, next) => {
  const { projectId, taskId, commentId } = req.params;

  const response = await Promise.all([
    Project.findById(projectId),
    Task.findById(taskId),
    Comment.findById(commentId),
  ]);

  const project = response[0];

  const task = response[1];

  const fetchedComment = response[2];

  if (!project || !task || !project.tasks.includes(taskId) || !fetchedComment) {
    return next(
      new AppError("Invalid project or task ID of comment Id provided", 400)
    );
  }

  if (!fetchedComment.user.equals(req.user.id)) {
    return next(new AppError("only the comment owner can update it", 400));
  }

  res.status(200).json({
    status: succOrFail(1),
    data: {
      data: fetchedComment,
    },
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const { projectId, taskId, commentId } = req.params;

  const response = await Promise.all([
    Project.findById(projectId),
    Task.findById(taskId),
    Comment.findById(commentId),
  ]);

  const project = response[0];

  const task = response[1];

  const fetchedComment = response[2];

  if (!project || !task || !project.tasks.includes(taskId) || !fetchedComment) {
    return next(
      new AppError("Invalid project or task ID of comment Id provided", 400)
    );
  }

  if (!fetchedComment.user.equals(req.user.id)) {
    return next(new AppError("only the comment owner can update it", 400));
  }

  await Comment.findByIdAndDelete(commentId);

  res.status(200).json({
    status: succOrFail(1),
    data: null,
  });
});

exports.getAllTaskComments = catchAsync(async (req, res, next) => {
  const { projectId, taskId } = req.params;
  const { page = 1, limit = 10 } = req.query; // default values for page and limit

  const [project, task] = await Promise.all([
    Project.findById(projectId),
    Task.findById(taskId),
  ]);

  if (!project || !task || !project.tasks.includes(taskId)) {
    return next(new AppError("Invalid project or task ID provided", 400));
  }

  const totalComments = await Comment.countDocuments({ task: taskId });
  const totalPages = Math.ceil(totalComments / limit);
  const skip = (page - 1) * limit;

  const comments = await Comment.find({ task: taskId }).skip(skip).limit(limit);

  res.status(200).json({
    status: succOrFail(1),
    data: {
      data: comments,
      page,
      totalPages,
    },
  });
});
