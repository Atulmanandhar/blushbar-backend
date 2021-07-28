const { check } = require("express-validator");

exports.createCategoryValidator = [
  check("categoryName")
    .trim()
    .notEmpty()
    .withMessage("Category Name is required"),
];
