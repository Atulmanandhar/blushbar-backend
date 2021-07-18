const { validationResult } = require("express-validator");
const fs = require("fs");

exports.runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //422 unprocessable entitty
    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }
  next();
};

exports.runValidationwithImages = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.files) {
      req.files.map((file) => {
        fs.unlinkSync(file.path);
      });
    }
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(422).json({
      error: errors.array()[0].msg,
    });
  }
  next();
};
