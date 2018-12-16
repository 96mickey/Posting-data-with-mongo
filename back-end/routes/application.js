var express = require("express");
var router = express.Router();
const applicationControllers = require("../controllers/application.js");

//auth routes
//need middleware to show posts to random visitors, but for now it is simple auth.
router.post("/login", applicationControllers.login);
router.post("/register", applicationControllers.register);
router.get("/confirm-profile", applicationControllers.confirmProfile);
router.delete("/logout", applicationControllers.logout);

//application routes
router
    .route('/post')
    .get(applicationControllers.fetchPost)
    .post(applicationControllers.post)
    
router
    .route('/like/:post')
    .post(applicationControllers.likePost)
    .delete(applicationControllers.unLikePost)

module.exports = router;
