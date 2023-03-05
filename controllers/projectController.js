const { findByIdAndUpdate, findById } = require("../models/Project");
const Project = require("../models/Project");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catch_async");
const { succOrFail } = require("../utils/message");

exports.createProject = catchAsync(async (req, res, next) => {
  const { memberNames, name, description } = req.body;

  const project = new Project({
    name,
    description,
    members: [],
    creator: req.user.id,
  });

  const uniqueMembers = [...new Set(memberNames)];

  const users = await Promise.all(
    uniqueMembers.map((mem) => User.findOne({ name: mem }))
  );

  users.forEach((mem) => {
    if (mem) {
      if (!mem._id.equals(req.user.id)) {
        project.members.push(mem._id);
      }
    }
  });

  await project.save();

  res.status(201).json({
    status: succOrFail(1),
    data: {
      data: project,
    },
  });
});

exports.addMember = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    return next(
      new AppError(
        "Please Provide a member name to be added to your project",
        400
      )
    );
  }

  const member = await User.findOne({ name: name });

  if (!member) {
    return next(
      new AppError(
        "there is not user with the provided name! Please make sure to provide the correct user name",
        404
      )
    );
  }
  // validate that only the admin who can add a member to the project
  let admin = await Project.findById(req.params.projectId);

  if (!admin) {
    return next(new AppError("there is not project with the provided id", 404));
  }

  if (!admin.creator.equals(req.user.id)) {
    return next(
      new AppError("Only the admin of the project can add members", 401)
    );
  }

  if (member._id.equals(admin.creator)) {
    return next(new AppError("You are already the admin of the group", 400));
  }

  if (admin.members.includes(member._id)) {
    return next(new AppError("the user already exists", 409));
  }

  admin.members.push(member._id);

  await admin.save({ validateModifiedOnly: true });

  res.status(200).json({
    status: succOrFail(1),
    data: {
      data: admin,
    },
  });
});

exports.updateProject = catchAsync(async (req, res, next) => {
  const { name, description, endDate, completion } = req.body;

  const updatedProject = await Project.findById(req.params.projectId);

  if (!updatedProject) {
    return next(new AppError("There is not project with the provided Id", 404));
  }

  if (!updatedProject.creator.equals(req.user.id)) {
    return next(
      new AppError("Only the project Admin can update the project data", 400)
    );
  }

  if (updatedProject.completion === 100) {
    return next(
      new AppError(
        "The project has already been completed, it cannot be updated",
        400
      )
    );
  }

  updatedProject.name = name || updatedProject.name;
  updatedProject.description = description || updatedProject.description;
  updatedProject.endDate = endDate || updatedProject.endDate;
  updatedProject.completion = completion || updatedProject.completion;

  await updatedProject.save();

  res.status(200).json({
    status: succOrFail(1),
    data: {
      data: updatedProject,
    },
  });
});

exports.deleteMember = catchAsync(async (req, res, next) => {
  const { projectId, memberId } = req.params;

  if (!memberId) {
    return next(new AppError("Please Provide the member to be deleted", 400));
  }

  const project = await Project.findById(projectId);

  if (!project) {
    return next(new AppError("There is no project with the provided ID", 404));
  }

  if (!project.creator.equals(req.user.id)) {
    return next(
      new AppError("you are not allowed to delete users from this team", 401)
    );
  }

  if (!project.members.includes(memberId)) {
    return next(new AppError("the member is not in your project team", 404));
  }

  const memberIndex = project.members.indexOf(memberId);

  project.members.splice(memberIndex, 1);

  await project.save();

  res.status(200).json({
    status: succOrFail(1),
    data: {
      data: project,
    },
  });
});

exports.deleteProject = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    return next(new AppError("The project is not exist", 404));
  }

  if (!project.creator.equals(req.user.id)) {
    return next(
      new AppError("You are not allowed to delete this project", 401)
    );
  }

  await Project.findByIdAndDelete(projectId);

  res.status(204).json({
    status: succOrFail(1),
    data: null,
  });
});

exports.getProject = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;

  const fetchedProject = await Project.findById(projectId);

  if (!fetchedProject) {
    return next(new AppError("There is no project with the provided Id", 404));
  }

  const project = await Project.findOne({
    _id: projectId,
    $or: [{ creator: req.user.id }, { members: req.user.id }],
  });

  if (!project) {
    return next(new AppError("you are not allowed to acces this project", 401));
  }

  res.status(200).json({
    status: succOrFail(1),
    data: {
      data: project,
    },
  });
});

exports.getAllUserProjects = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const projects = await Project.find({
    $or: [{ creator: req.user.id }, { members: req.user.id }],
  })
    .skip((page - 1) * limit)
    .limit(10);
  // .populate("members");

  res.status(200).json({
    status: succOrFail(1),
    results: projects.length,
    data: {
      data: projects,
    },
  });
});

exports.getProjectMembers = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    return next(new AppError("There is no project with the provided id", 404));
  }

  // console.log(project.members.includes(req.user.id));
  // console.log(project.creator.equals(req.user.id));

  if (
    project.members.includes(req.user.id) ||
    project.creator.equals(req.user.id)
  ) {
    const members = await Project.findById(projectId)
      .select("members creator")
      .populate("members")
      .populate("creator");

    // const members = Project.find()

    res.status(200).json({
      status: succOrFail(1),
      data: {
        data: members,
      },
    });
  } else {
    return next(new AppError("You don't have acces to this project", 403));
  }
});

// need to tested after inserting some tasks
exports.getProjectTasks = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    return next(new AppError("There is no project with the provided id", 404));
  }

  if (
    project.members.includes(req.user.id) ||
    project.creator.equals(req.user.id)
  ) {
    const PAGE_SIZE = 10; // number of comments to return per page
    const page = req.query.page || 1; // get the page number from the query string (default to page 1)

    const tasks = await Project.findById(projectId)
      .select("tasks")
      .populate({
        path: "tasks",
        populate: {
          path: "comments",
          model: "Comment",
          select: "user -task comment",
          populate: {
            path: "user",
            model: "User",
            select: "name email",
          },
          options: {
            skip: (page - 1) * PAGE_SIZE, // skip the comments on previous pages
            limit: PAGE_SIZE, // limit the number of comments on this page
          },
        },
      });

    res.status(200).json({
      status: succOrFail(1),
      results: tasks.tasks.length,
      data: {
        data: tasks,
      },
    });
  } else {
    return next(new AppError("You don't have acces to this project", 403));
  }
});
