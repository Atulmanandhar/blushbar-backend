const { check } = require("express-validator");

exports.createPromoCodeValidator = [
  check("codeName").trim().notEmpty().withMessage("codeName is required"),
  check("codeDiscount")
    .trim()
    .notEmpty()
    .withMessage("codeDiscount is required"),
  check("codeDiscount")
    .isNumeric()
    .withMessage("codeDiscount must be a number"),
  check("minOrder").trim().notEmpty().withMessage("codeDiscount is required"),
  check("minOrder").isNumeric().withMessage("codeDiscount must be a number"),
  check("message").trim().notEmpty().withMessage("message is required"),
  check("validUpto").notEmpty().withMessage("validUpto is required"),
  check("validUpto").isDate().withMessage("validUpto is wrong format"),
  check("discountType")
    .not()
    .isEmpty()
    .withMessage("discountType cannot be empty. Should be percent or amount"),
  check("discountType")
    .isIn(["percent", "amount"])
    .withMessage("discountType can only be be percent or amount "),
];

exports.updatePromoCodeValidator = [
  check("codeName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("codeName is required"),
  check("codeDiscount")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("codeDiscount is required"),
  check("codeDiscount")
    .optional()
    .isNumeric()
    .withMessage("codeDiscount must be a number"),
  check("minOrder")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("codeDiscount is required"),
  check("minOrder")
    .optional()
    .isNumeric()
    .withMessage("codeDiscount must be a number"),
  check("message")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("message is required"),
  check("validUpto").optional().notEmpty().withMessage("validUpto is required"),
  check("validUpto")
    .optional()
    .isDate()
    .withMessage("validUpto is wrong format"),
  check("discountType")
    .optional()
    .not()
    .isEmpty()
    .withMessage("discountType cannot be empty. Should be percent or amount"),
  check("discountType")
    .optional()
    .isIn(["percent", "amount"])
    .withMessage("discountType can only be be percent or amount "),
];
