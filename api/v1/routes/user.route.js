const express = require("express");
const {
  read,
  update,
  deleteUser,
  imageUpload,
  sendSms,
  verifySms,
  getUserByUserId,
} = require("../controllers/user.controller");

const router = express.Router();
const multer = require("multer");
const {
  requireSignin,
  adminMiddleWare,
} = require("../middleware/auth.middleware");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/profile/");
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
        "You can only upload a maximum of 1 files. File can be of jpeg or png files only"
      )
    );
  }
};
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 3, //3mb
  },
  fileFilter: fileFilter,
});

const uploadMiddleWare = upload.single("profilePicture");

router.get("/user/", requireSignin, read);
router.patch("/user/update", requireSignin, update);

router.post("/user/sendSms", requireSignin, sendSms);

router.post("/user/verifySms", requireSignin, verifySms);

//update profile picture
router.patch(
  "/user/updateProfilePicture",
  requireSignin,
  function (req, res, next) {
    uploadMiddleWare(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(500).json({
          error: "Files cannot be larger than 3mb.Available formats: jpg/png",
        });
      } else if (err) {
        return res.status(500).json({
          error: "Error uploading files. Please try again",
          err,
        });
        // An unknown error occurred when uploading.
      }

      next();
    });
  },
  imageUpload
);

//router get user by userId (works for both artist and users)
router.get("/user/:userId", requireSignin, adminMiddleWare, getUserByUserId);

router.delete(
  "/admin/user/:userId",
  requireSignin,
  adminMiddleWare,
  deleteUser
);

module.exports = router;
