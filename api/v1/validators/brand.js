const { check } = require("express-validator");

exports.createBrandValidator = [
  check("brandName").trim().notEmpty().withMessage("brandName is required"),
];

exports.updateBrandValidator = [
  check("brandName")
    .trim()
    .notEmpty()
    .withMessage("brandName cannot be empty"),
];
