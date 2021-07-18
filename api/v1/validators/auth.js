const { check } = require("express-validator");

exports.userSignupValidator = [
  check("name").not().isEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Must be a vaild Email address"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be atleast 6 characters long"),

  check("role")
    .optional()
    .isIn(["subscriber", "admin"])
    .withMessage("Roles can only be subscriber or admin "),
];
exports.userSigninValidator = [
  check("email").isEmail().withMessage("Must be a vaild Email address"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be atleast 6 characters long"),
];

exports.changePasswordValidator = [
  check("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be atleast 6 characters long"),
];

exports.forgotPasswordValidator = [
  check("email")
    .not()
    .isEmpty()
    .isEmail()
    .withMessage("Must be a vaild Email address"),
];
exports.resetPasswordValidator = [
  check("newPassword")
    .not()
    .isEmpty()
    .isLength({ min: 6 })
    .withMessage("Password must be atleast 6 characters long"),
];
