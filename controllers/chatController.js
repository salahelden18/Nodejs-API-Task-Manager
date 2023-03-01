const Chat = require("../models/Chat");
const Project = require("../models/Project");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catch_async");

exports.getAllProjectChatMessages = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    return next(new AppError("There is project with the provided Id", 404));
  }

  if (
    project.creator.equals(req.user.id) ||
    project.members.includes(req.user.id)
  ) {
    const messages = await Chat.find({ project: projectId });

    res.status(200).json({
      status: "success",
      data: {
        data: messages,
      },
    });
  } else {
    return next(
      new AppError("You don't have permission tp access this chat", 401)
    );
  }
});
