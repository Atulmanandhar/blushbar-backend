const router = require("express").Router();

const mongoose = require("mongoose");
const {
  createBrand,
  updateBrand,
  getBrand,
  deleteBrandById,
} = require("../controllers/brand.controller");
const {
  requireSignin,
  adminMiddleWare,
} = require("../middleware/auth.middleware");
const {
  createBrandValidator,
  updateBrandValidator,
} = require("../validators/brand");
const { runValidation } = require("../validators/");

//Admin - Create a brand
router.post(
  "/brand",
  requireSignin,
  adminMiddleWare,
  createBrandValidator,
  runValidation,
  createBrand
);

//Get all Brand
router.get("/brand", getBrand);

//Delete category By admin
router.delete(
  "/brand/:brandId",
  requireSignin,
  adminMiddleWare,
  deleteBrandById
);
router.patch("/brand/:brandId", requireSignin, adminMiddleWare, updateBrand);

module.exports = router;
