const express = require("express");
const authController = require("../controllers/authController");
const taskController = require("../controllers/taskController");
const projectController = require("../controllers/projectController");
const commentRouter = require("./commentRoute");

const router = express.Router({ mergeParams: true });

router.use("/:taskId/comment", commentRouter);

router.get("/", authController.protect, projectController.getProjectTasks);

router.post("/", authController.protect, taskController.addTask);

router
  .route("/:taskId")
  .patch(authController.protect, taskController.updateTask)
  .delete(authController.protect, taskController.deleteTask)
  .get(authController.protect, taskController.getTask);

router.patch(
  "/:taskId/assignUser",
  authController.protect,
  taskController.assignTask
);

module.exports = router;
