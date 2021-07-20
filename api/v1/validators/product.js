const { check } = require("express-validator");

exports.createProductValidator = [
  check("productName")
    .trim()
    .notEmpty()
    .withMessage("Product Name is required"),
  check("productPrice").notEmpty().withMessage("Product Price is required"),
  check("productPrice")
    .isNumeric()
    .withMessage("Product Price must be a number"),
  check("productDescription")
    .trim()
    .notEmpty()
    .withMessage("Product Description is required"),
  check("category").trim().notEmpty().withMessage("category  is required"),
  check("productBrand")
    .trim()
    .notEmpty()
    .withMessage("Product Brand is required"),

  check("showFirstPage").notEmpty().withMessage("Show First Page is required"),
  check("showFirstPage")
    .isBoolean()
    .withMessage("Show first page must be a boolean"),
];

exports.updateProductValidator = [
  check("productName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product Name is required"),
  check("productPrice")
    .optional()
    .isNumeric()
    .withMessage("Product Price must be a number"),
  check("productDescription")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product Description is required"),
  check("category")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("category is required"),
  check("productBrand")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("productBrand is required"),
  check("showFirstPage")
    .optional()
    .notEmpty()
    .withMessage("Show First Page is required"),
  check("showFirstPage")
    .optional()
    .isBoolean()
    .withMessage("Show first page must be a boolean"),
];
