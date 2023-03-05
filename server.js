const dotenv = require("dotenv").config({
  path: "./config.env",
});
const mongoose = require("mongoose");
// const http = require("http");
// const socketIO = require("socket.io");
const app = require("./app");
// const {
//   userIsAuthorized,
//   saveMessageToDatabase,
//   authMiddleware,
// } = require("./utils/realTimeMethods");

// const server = http.createServer(app);

// const io = socketIO(server);

// MongoDB Connection
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Database connected");
  })
  .catch((e) => console.log("Something went wrong", e));

// starting real time
// io.on("connection", (socket) => {
//   console.log(`New Connection ${socket.id}`);

//   // protect middleware only registered users can send message
//   io.use(authMiddleware);

//   // send message
//   socket.on("sendMessage", async (data) => {
//     if (await userIsAuthorized(data.projectId, socket.user.id)) {
//       await saveMessageToDatabase(data.projectId, socket.user.id, data.message);

//       socket.broadcast.to(`project-${data.projectId}`).emit("newMessage", data);
//     }
//   });

//   socket.on("joinRoom", (projectId) => {
//     if (userIsAuthorized(projectId, socket.user.id)) {
//       socket.join(`project-${projectId}`);
//     }
//   });

//   socket.on("disconnect", (data) => {
//     socket.broadcast.to(`project-${data.projectId}`).emit("left-chat");
//   });
// });

// Start Listening
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Start Listening on port " + port);
});
