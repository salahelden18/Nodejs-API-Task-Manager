const { succOrFail } = require("../utils/message");
const Task = require("../models/Task");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catch_async");
const Project = require("../models/Project");

exports.addTask = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    return next(new AppError("There is no project with the provided id", 404));
  }

  if (!project.creator.equals(req.user.id)) {
    return next(
      new AppError("Only Admin of the project can create a task", 401)
    );
  }
  const task = Task(req.body);

  if (
    project.tasks.length === 0 ||
    !req.body.assignee ||
    project.members.includes(task.assignee)
  ) {
    project.tasks.push(task._id);

    await Promise.all([task.save(), project.save()]);

    res.status(201).json({
      status: succOrFail(1),
      data: {
        data: task,
      },
    });
  } else {
    return next(
      new AppError("You cannot assign task to member out of the project", 400)
    );
  }
});

exports.assignTask = catchAsync(async (req, res, next) => {
  const { projectId, taskId } = req.params;

  const { assigneeId } = req.body;

  if (!assigneeId) {
    return next(new AppError("Please Provided the user's id", 400));
  }

  const project = await Project.findById(projectId);

  if (!project) {
    return next(new AppError("There is no project with the provided Id", 404));
  }

  const task = await Task.findById(taskId);

  if (!task) {
    return next(new AppError("there is no task with the provided id", 404));
  }

  if (task.assignee.equals(assigneeId)) {
    return next(new AppError("The task is already assigned to this user", 400));
  }

  if (!project.members.includes(assigneeId)) {
    return next(
      new AppError("Please Add the user first to assign him a task", 400)
    );
  }

  if (!project.creator.equals(req.user.id)) {
    return next(
      new AppError("Only the creator of the project can assign tasks", 401)
    );
  }

  task.assignee = assigneeId;

  await task.save({ validateModifiedOnly: true });

  res.status(200).json({
    status: succOrFail(1),
    data: {
      data: task,
    },
  });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  const { title, description, priority, status, dueDate, assignee } = req.body;
  const { projectId, taskId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    return next(new AppError("There is no project with the provided Id", 404));
  }

  if (assignee) {
    return next(
      new AppError(
        "Please use the /assignUser route instead of this route",
        400
      )
    );
  }

  const task = await Task.findById(taskId);

  if (!task) {
    return next(new AppError("There is n task with the provided Id", 404));
  }

  if (
    project.creator.equals(req.user.id) ||
    project.members.includes(req.user.id)
  ) {
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        title: (project.creator.equals(req.user.id) && title) || task.title,
        description:
          (project.creator.equals(req.user.id) && description) ||
          task.description,
        priority: priority || task.priority,
        status: status || task.status,
        dueDate:
          (project.creator.equals(req.user.id) && dueDate) ||
          task.dueDate ||
          null,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: succOrFail(1),
      data: {
        data: updatedTask,
      },
    });
  } else {
    return next(
      new AppError(
        "Only the creator and members of a task can change the task",
        401
      )
    );
  }
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  const { projectId, taskId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    return next(new AppError("there is no project with the provided Id", 404));
  }

  if (!project.creator.equals(req.user.id) || project.completion === 100) {
    return next(
      new AppError(
        "Only the admin can delete a project and the project shouldn't be completed",
        400
      )
    );
  }

  const task = await Task.findById(taskId);

  if (!task) {
    return next(new AppError("there is no task with the provided Id", 404));
  }

  await Task.deleteOne({ _id: taskId });

  res.status(204).json({
    status: succOrFail(1),
    data: null,
  });
});

exports.getTask = catchAsync(async (req, res, next) => {
  const { projectId, taskId } = req.params;

  const PAGE_SIZE = 10; // number of comments to return per page
  const page = req.query.page || 1; // get the page number from the query string (default to page 1)

  const [project, task] = await Promise.all([
    Project.findById(projectId),
    Task.findById(taskId).populate({
      path: "comments",
      populate: {
        path: "user",
        model: "User",
      },
      options: {
        skip: (page - 1) * PAGE_SIZE, // skip the comments on previous pages
        limit: PAGE_SIZE, // limit the number of comments on this page
      },
    }),
  ]);

  if (!project || !task || !project.tasks.includes(taskId)) {
    return next(new AppError("Invalid project or task ID provided", 400));
  }

  res.status(200).json({
    status: succOrFail(1),
    data: {
      data: task,
    },
  });
});
