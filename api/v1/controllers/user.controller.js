let DEBUG;
if (process.env.NODE_ENV === "development") {
  DEBUG = true;
} else {
  DEBUG = false;
}

const User = require("../models/user.model");
const { ImageRemover } = require("../helpers/ImageRemover");
const { google } = require("googleapis");

exports.read = (req, res) => {
  const userId = req.user._id;
  //findOne({_id:userId})
  User.findById(userId)
    .select("-__v -hashed_password -salt")
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          error: "User not found",
          success: false,
        });
      }
      res.json(user);
    })
    .catch((err) => {
      return res.status(400).json({
        error: "User not found",
        success: false,
      });
    });
};

//phone verify ko lagi need to make seperate api

exports.sendSms = async (req, res) => {
  const { phoneNumber, recapchaToken } = req.body;

  const identityToolkit = google.identitytoolkit({
    auth: process.env.GCP_KEY,
    version: "v3",
  });

  try {
    const response = await identityToolkit.relyingparty.sendVerificationCode({
      phoneNumber,
      recaptchaToken: recapchaToken,
    });

    //send sessionInfo to the user, so he can verify it
    // save sessionInfo into db. You will need this to verify the SMS code
    const sessionInfo = response.data.sessionInfo;

    return res.status(200).json({ data: sessionInfo, success: true });
  } catch (err) {
    res.status(500).json({
      error: err.response.data.error.message || "Something went wrong.",
      success: false,
    });
  }
};

//verify phone
exports.verifySms = async (req, res) => {
  const { _id } = req.user;
  const { verificationCode, sessionInfo } = req.body;

  const identityToolkit = google.identitytoolkit({
    auth: process.env.GCP_KEY,
    version: "v3",
  });

  try {
    const result = await identityToolkit.relyingparty.verifyPhoneNumber({
      code: verificationCode,
      sessionInfo: sessionInfo,
    });

    const updateUser = await User.findByIdAndUpdate(_id, {
      $set: { isPhoneVerified: true, phoneNumber: result.data.phoneNumber },
    }).exec();
    if (!updateUser) {
      return res.status(500).json({
        error: "Something went wrong. Error updating user in the database",
        success: false,
      });
    }
    res.status(201).json({
      message: "The phone Number has succcessfully been verified",
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      error: err.response.data.error.message || "Something went wrong.",
      success: false,
    });
  }
};

exports.update = (req, res) => {
  // console.log("UPDATE Data- req.body",req.body )

  console.log(req.user._id);
  const { name } = req.body;
  User.findById(req.user._id)
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          error: "User not found",
          success: false,
        });
      }
      if (!name) {
        return res.status(400).json({
          error: "Name is Required",
          success: false,
        });
      } else {
        user.name = name;
      }

      user
        .save()
        .then((updatedUser) => {
          updatedUser.hashed_password = undefined;
          updatedUser.salt = undefined;
          updatedUser.__v = undefined;
          updatedUser.createdAt = undefined;
          updatedUser.updatedAt = undefined;

          res.json(updatedUser);
        })
        .catch((err) => {
          DEBUG && console.log("Uer update failed", err);
          return res.status(400).json({
            error: "User update failed",
            success: false,
          });
        });
    })
    .catch((err) => {
      return res.status(400).json({
        error: err,
        success: false,
      });
    });
};
//ADMIN ONLY
exports.deleteUser = async (req, res) => {
  try {
    const result = await User.findByIdAndRemove(req.params.userId).exec();
    if (!result)
      return res
        .status(401)
        .json({ error: "Error. User not found", success: false });
    return res
      .status(201)
      .json({ message: "Successfuly deleted user", success: true });
  } catch (err) {
    return res.status(500).json({ error: err, success: false });
  }
};

exports.imageUpload = (req, res) => {
  // console.log(req.headers.host + "/" + req.file.path);
  if (req.file === undefined) {
    return res.status(400).json({
      error:
        "Error uploading profile picture. Please send the correct image format and make sure the size is below 3mb.",
      success: false,
    });
  }

  User.findById(req.user._id)
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          error: "User not found",
          success: false,
        });
      }
      ImageRemover(user.profilePicture, "profile", req.headers.host);

      const urlScheme = DEBUG ? req.protocol + "://" : "https://";
      const filePath = req.file.path.replace(/\\/g, "/");

      user.profilePicture = urlScheme + req.headers.host + "/" + filePath;
      user
        .save()
        .then((updatedUser) => {
          updatedUser.hashed_password = undefined;
          updatedUser.salt = undefined;
          res.status(201).json({
            message: "Profile picture",
            data: updatedUser,
            success: true,
          });
        })
        .catch((err) => {
          return res.status(400).json({
            error: "User update failed",
            success: false,
          });
        });
    })
    .catch((err) => {
      return res.status(400).json({
        error: err,
        success: false,
      });
    });
};

exports.getUserByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const userResult = await User.findOne({
      _id: userId,
    })
      .select(
        "-__v -hashed_password -salt -createdAt -updatedAt -resetPasswordLink"
      )
      .exec();
    if (!userResult)
      return res.status(404).json({
        error: `Couldnt find the artist with the Id ${artistId}`,
        success: false,
      });
    res.status(200).json({ data: userResult, success: true });
  } catch (err) {
    return res.status(500).json({ error: err, success: false });
  }
};
