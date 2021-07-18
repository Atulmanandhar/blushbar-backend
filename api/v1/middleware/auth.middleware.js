const User = require("../models/user.model")
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");


exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});


exports.adminMiddleWare = (req, res, next) => {
  User.findById({ _id: req.user._id })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          error: "USER NOT FOUND",
        });
      }
      if (user.role !== "admin") {
        return res.status(400).json({
          error: "Admin resource access denied",
        });
      }
      req.profile = user;
      next();
    })
    .catch((err) => {
      return res.status(400).json({
        error: "USER NOT FOUND",
      });
    });
};

exports.subscriberMiddleWare = (req, res, next) => {
  User.findById({ _id: req.user._id })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          error: "USER NOT FOUND",
        });
      }
      if (user.role !== "subscriber") {
        return res.status(400).json({
          error: "Subscriber only resource denied.",
        });
      }
      req.profile = user;
      next();
    })
    .catch((err) => {
      return res.status(400).json({
        error: "USER NOT FOUND",
      });
    });
};

