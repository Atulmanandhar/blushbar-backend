const { check } = require("express-validator");

exports.createBannerValidator = [
  check("bannerType").notEmpty().withMessage("Order Date is required"),
  check("bannerType")
    .isIn(["small", "large"])
    .withMessage("bannerType can only be of small or large."),
  check("promotionType").notEmpty().withMessage("Order Date is required"),
  check("promotionType")
    .isIn(["product", "brand"])
    .withMessage("promotionType can only be of product or brand."),
];
exports.updateBannerValidator = [
  check("bannerType")
    .optional()
    .notEmpty()
    .withMessage("Order Date is required"),
  check("bannerType")
    .optional()
    .isIn(["small", "large"])
    .withMessage("bannerType can only be of small or large."),
  check("promotionType")
    .optional()
    .notEmpty()
    .withMessage("Order Date is required"),
  check("promotionType")
    .optional()
    .isIn(["product", "brand"])
    .withMessage("promotionType can only be of product or brand."),
];
