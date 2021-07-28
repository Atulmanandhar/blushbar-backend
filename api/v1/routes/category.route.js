const router = require("express").Router();

const mongoose = require("mongoose");
const {
  createCategory,
  updateCategory,
  getCategory,
  deleteCategoryById,
} = require("../controllers/category.controller");
const {
  requireSignin,
  adminMiddleWare,
} = require("../middleware/auth.middleware");
const { createCategoryValidator } = require("../validators/category");
const { runValidationwithImages } = require("../validators/");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/category/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname +
        "-" +
        (Date.now() * (100 - 1) + 1) +
        path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false); //reject file
    cb(
      new Error(
        "You can only upload a maximum of 6 files. File can be of jpeg,png or pdf files only"
      )
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 4, //4mb
  },
  fileFilter: fileFilter,
});

const uploadMiddleWare = upload.single("categoryImage");

//Admin - Create a category
router.post(
  "/category",
  requireSignin,
  adminMiddleWare,
  function (req, res, next) {
    uploadMiddleWare(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(500).json({
          error:
            "You can only upload a maximum of 1 files. File can be of jpeg and pngs only",
          err,
        });
      } else if (err) {
        return res.status(500).json({
          error: "Error uploading files. Please try again",
          err,
        });
      }
      next();
    });
  },
  createCategoryValidator,
  runValidationwithImages,
  createCategory
);

//update a category by admin
router.patch(
  "/category/:categoryId",
  requireSignin,
  adminMiddleWare,
  function (req, res, next) {
    uploadMiddleWare(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(500).json({
          error:
            "You can only upload a maximum of 1 files. File can be of jpeg and pngs only",
          err,
        });
      } else if (err) {
        return res.status(500).json({
          error: "Error uploading files. Please try again",
          err,
        });
      }

      next();
    });
  },
  createCategoryValidator,
  runValidationwithImages,
  updateCategory
);

//Get all Categories
router.get("/category", getCategory);

//Delete category By admin
router.delete(
  "/category/:categoryId",
  requireSignin,
  adminMiddleWare,
  deleteCategoryById
);

module.exports = router;
