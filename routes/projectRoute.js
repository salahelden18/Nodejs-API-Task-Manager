const express = require("express");
const authController = require("../controllers/authController");
const projectController = require("../controllers/projectController");
const router = express.Router();
const taskRouter = require("./taskRoute");

router
  .route("/")
  .post(authController.protect, projectController.createProject)
  .get(authController.protect, projectController.getAllUserProjects);

router.patch(
  "/:projectId/addMember",
  authController.protect,
  projectController.addMember
);

router
  .route("/:projectId")
  .get(authController.protect, projectController.getProject)
  .patch(authController.protect, projectController.updateProject)
  .delete(authController.protect, projectController.deleteProject);

router.delete(
  "/:projectId/deleteMember/:memberId",
  authController.protect,
  projectController.deleteMember
);

router.get(
  "/:projectId/members",
  authController.protect,
  projectController.getProjectMembers
);

router.use("/:projectId/tasks", taskRouter);

// router.patch(
//   "/deleteMember/:projectId",
//   authController.protect,
//   projectController.deleteMember
// );

module.exports = router;
