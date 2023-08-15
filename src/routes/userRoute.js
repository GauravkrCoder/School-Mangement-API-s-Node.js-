var express = require("express");
var router = express();

router.use(
  express.urlencoded({
    extended: true,
  })
);
router.use(
  express.json({
    limit: 100000000,
    extended: true,
  })
);
router.use(express.static("src/assets/uploadedImages"));

/* import controller files into route file to trigger the request methods.*/
var userController = require("../controllers/user.controller");

/* Defining the Routes for different API's */
router.get("/getuserlist", userController.getUserList);
router.post("/register", userController.signUp);
router.post("/login", userController.login);
router.post("/forget-password", userController.forgetPassword);
router.post("/reset-password", userController.resetPassword);
router.post("/uploadpic", userController.uploadProfilePicture);
router.get("/getimage", userController.getProfilePic);

module.exports = {
  router,
};
