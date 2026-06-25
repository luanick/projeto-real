var express = require("express");
var router = express.Router();
const userController = require("./userController");
const { registerValidator, loginValidator } = require("./userValidator");
const asyncHandler = require("../../middlewares/asyncHandler"); 

router.get("/register", userController.renderRegisterForm);
router.post("/register", registerValidator, asyncHandler(userController.register));

router.get("/login", userController.renderLoginForm);
router.post("/login", loginValidator, asyncHandler(userController.login));
router.get("/logout", userController.logout);

module.exports = router;