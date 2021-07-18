const express = require("express");
const router = express.Router();
const {
  signup,
  accountActivation,
  signin,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/auth.controller");
const {
  userSignupValidator,
  userSigninValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
} = require("../validators/auth");
const { runValidation } = require("../validators/");
const { requireSignin } = require("../middleware/auth.middleware");

router.post("/signup", userSignupValidator, runValidation, signup);
router.post("/account-activation", accountActivation);
router.post("/signin", userSigninValidator, runValidation, signin);

router.post(
  "/changePassword",
  changePasswordValidator,
  runValidation,
  requireSignin,
  changePassword
);

router.put(
  "/forgot-password",
  forgotPasswordValidator,
  runValidation,
  forgotPassword
);

router.put(
  "/reset-password",
  resetPasswordValidator,
  runValidation,
  resetPassword
);

module.exports = router;
