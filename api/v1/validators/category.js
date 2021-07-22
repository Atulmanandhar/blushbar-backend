const { check } = require("express-validator");

exports.createCategoryValidator = [
  check("categoryName")
    .trim()
    .notEmpty()
    .withMessage("Category Name is required"),
];

exports.updateCategoryValidator = [
  check("categoryName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category Name cannot be empty"),
];
