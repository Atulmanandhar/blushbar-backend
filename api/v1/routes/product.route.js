const router = require("express").Router();

const mongoose = require("mongoose");
const {
  createProduct,
  updateProduct,
  getProduct,
  getProductById,
  deleteProductById,
} = require("../controllers/product.controller");
const {
  requireSignin,
  adminMiddleWare,
} = require("../middleware/auth.middleware");
const { createProductValidator,updateProductValidator } = require("../validators/product");
const { runValidationwithImages } = require("../validators/");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/product/");
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

const uploadMiddleWare = upload.array("productImages", 4);



router.get("/product", getProduct);

router.get("/product/:productId", getProductById);

router.delete(
  "/product/:productId",
  requireSignin,
  adminMiddleWare,
  deleteProductById
);

//only admin can create products
router.post(
  "/product",
  requireSignin,
  adminMiddleWare,
  function (req, res, next) {
    uploadMiddleWare(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(500).json({
          error:
            "You can only upload a maximum of 6 files. File can be of jpeg and pngs only",
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
  createProductValidator,
  runValidationwithImages,
  createProduct
);


//only admin can patch products
router.patch(
  "/product/:productId",
  requireSignin,
  adminMiddleWare,
  function (req, res, next) {
    uploadMiddleWare(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(500).json({
          error:
            "You can only upload a maximum of 6 files. File can be of jpeg,png or pdf files only",
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
  updateProductValidator,
  runValidationwithImages,
  updateProduct
);





module.exports = router;
