const { check } = require("express-validator");

exports.createProductValidator = [
  check("productName")
    .trim()
    .notEmpty()
    .withMessage("Product Name is required"),
  check("itemCode").trim().notEmpty().withMessage("itemCode is required"),
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

  check("totalStock").notEmpty().withMessage("Total Stock is required"),
  check("totalStock").isNumeric().withMessage("Total Stock must be a number"),

  check("isBestSeller").notEmpty().withMessage("isBestSeller is required"),
  check("isBestSeller")
    .isBoolean()
    .withMessage("isBestSeller must be a boolean"),
  check("isNewArrival").notEmpty().withMessage("isNewArrival is required"),
  check("isNewArrival")
    .isBoolean()
    .withMessage("Best Seller must be a boolean"),
  check("isNewLaunch").notEmpty().withMessage("isNewArrival is required"),
  check("isNewLaunch").isBoolean().withMessage("isNewLaunch must be a boolean"),
  check("offerDiscount")
    .optional()
    .isBoolean()
    .withMessage("offerDiscount must be a boolean"),
  check("discountAmount")
    .optional()
    .isNumeric()
    .withMessage("discountAmount must be a number"),
  check("discountType")
    .optional()
    .isIn(["percent", "amount"])
    .withMessage("discountType can only be percent or amount "),
];

exports.updateProductValidator = [
  check("productName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product Name is required"),
  check("itemCode")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("itemCode is required"),
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
    .isBoolean()
    .withMessage("Show first page must be a boolean"),
  check("totalStock")
    .optional()
    .isNumeric()
    .withMessage("Total Stock must be a number"),
  check("isBestSeller")
    .optional()
    .isBoolean()
    .withMessage("isBestSeller must be a boolean"),
  check("isNewArrival")
    .optional()
    .isBoolean()
    .withMessage("isNewArrival must be a boolean"),
  check("isNewLaunch")
    .optional()
    .isBoolean()
    .withMessage("isNewLaunch must be a boolean"),
  check("offerDiscount")
    .optional()
    .isBoolean()
    .withMessage("offerDiscount must be a boolean"),
  check("discountAmount")
    .optional()
    .isNumeric()
    .withMessage("discountAmount must be a number"),
  check("discountType")
    .optional()
    .isIn(["percent", "amount"])
    .withMessage("discountType can only be percent or amount "),
];
