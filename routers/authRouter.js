const router = require("express").Router();
const authController = require("../controllers/authController");
const requireUser = require("../middlewares/requireUser");

router.post("/authenticate", authController.loginController);
router.post("/follow/:id", requireUser, authController.followuser);
router.post("/unfollow/:id", requireUser, authController.Unfollowuser);
router.get("/user", requireUser, authController.getUserProfile);

router.post("/posts", requireUser, authController.addPosts);
router.delete("/posts/:id", requireUser, authController.deletePost);
router.post("/like/:id", requireUser, authController.likePost);
router.post("/unlike/:id", requireUser, authController.unlikePost);
router.post("/comment/:id", requireUser, authController.addComment);
router.get("/posts/:id", authController.getPostWithId);
router.get("/all_posts", requireUser, authController.getAllPosts);

module.exports = router;
