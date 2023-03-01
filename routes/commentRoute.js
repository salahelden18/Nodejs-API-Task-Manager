const express = require("express");
const authController = require("../controllers/authController");
const commentController = require("../controllers/commentController");

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route("/")
  .post(commentController.addComment)
  .get(commentController.getAllTaskComments);

router
  .route("/:commentId")
  .patch(commentController.updateComment)
  .get(commentController.getComment)
  .delete(commentController.deleteComment);

module.exports = router;
