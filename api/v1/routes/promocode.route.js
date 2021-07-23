const router = require("express").Router();

const mongoose = require("mongoose");

const {
  createPromoCode,
  updatePromoCode,
  getPromoCode,
  deletePromoCodeById,
} = require("../controllers/promocode.controller");
const {
  createPromoCodeValidator,
  updatePromoCodeValidator,
} = require("../validators/promocode");
const {
  requireSignin,
  adminMiddleWare,
} = require("../middleware/auth.middleware");

const { runValidation } = require("../validators/");

//Admin - Create a brand
router.post(
  "/promoCode",
  requireSignin,
  adminMiddleWare,
  createPromoCodeValidator,
  runValidation,
  createPromoCode
);

//Get all Brand
router.get("/promoCode", getPromoCode);

//Delete category By admin
router.delete(
  "/promoCode/:promoCodeId",
  requireSignin,
  adminMiddleWare,
  deletePromoCodeById
);
router.patch(
  "/promoCode/:promoCodeId",
  requireSignin,
  adminMiddleWare,
  updatePromoCodeValidator,
  runValidation,
  updatePromoCode
);

module.exports = router;
