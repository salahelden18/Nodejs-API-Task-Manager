const catchAsync = require("./catch_async");
const Project = require("../models/Project");
const Chat = require("../models/Chat");

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("./AppError");

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

exports.authMiddleware = catchAsync(async (socket, next) => {
  const token = socket.handshake.query.token;
  const decoded = await verifyToken(token);
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError("There is not user with the provided Id", 404));
  }

  socket.user = user;
  next();
});

exports.userIsAuthorized = catchAsync(async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    return false;
  }

  const { creator, members } = project;
  if (creator.equals(userId) || members.includes(userId)) {
    return true;
  }

  return false;
});

exports.saveMessageToDatabase = catchAsync(
  async (projectId, userId, message) => {
    const newMessage = new Chat({
      project: projectId,
      user: userId,
      message,
    });

    await newMessage.save();
  }
);
