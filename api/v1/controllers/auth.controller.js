const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const sgMail = require("@sendgrid/mail");
const _ = require("lodash");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.signup = (req, res) => {
  const { name, email, password, phoneNumber } = req.body;
  User.findOne({ email })
    .exec()
    .then((user) => {
      if (user !== null) {
        //422 unprocessable entity,409 confilct error
        return res.status(409).json({
          error: "Email is taken",
        });
      }
      const token = jwt.sign(
        { name, email, password, phoneNumber },
        process.env.JWT_ACCOUNT_ACTIVATION,
        { expiresIn: "10m" }
      );

      const emailData = {
        from: `atulmdhr@gmail.com`,
        to: `izf.atul@gmail.com`,
        subject: `Account activation Link`,
        html: `
          <h1>Please use the following link to activate your account</h1>
          <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
          <hr />
          <p>This email may contain sensitive information </p>
          <p>${process.env.CLIENT_URL}</p>
          <p>The Blush Bar</p>
        `,
      };

      sgMail
        .send(emailData)
        .then((sent) => {
          console.log("SIGNUP EMAIL SENT", sent);
          console.log("SIGNUP EMAIL SENT", process.env.EMAIL_TO);
          return res.json({
            message: `Email has been sent to  ${email}. Follow the instructions to activate your account.`,
          });
        })
        .catch((err) => {
          console.log("mail err", err);
          return res.status(400).json({
            error: err,
          });
        });
    })
    .catch((err) => {
      console.log("find err", err);
      return res.status(400).json({
        error: err,
      });
    });
};

exports.accountActivation = (req, res) => {
  const { token } = req.body;
  if (token) {
    jwt.verify(
      token,
      process.env.JWT_ACCOUNT_ACTIVATION,
      function (err, decoded) {
        if (err) {
          console.log("JWT VERIFY IN ACCOUNT ACTIVATION ERR", err);
          return res.status(401).json({
            error: "Expired link, Signup Again",
          });
        }
        const { name, email, password, phoneNumber } = jwt.decode(token);
        const user = new User({ name, email, password, phoneNumber });
        user
          .save()
          .then(() => {
            return res.json({
              message: " Signup success. Please signin.",
            });
          })
          .catch((err) => {
            console.log("Save user in account activation error", err);
            return res.status(401).json({
              error: "Error saving user in db. Try again",
            });
          });
      }
    );
  } else {
    return res.json({
      message: "Something went wrong. Try again.",
    });
  }
};

exports.signin = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          error: "USer with that email doesnt exist",
        });
      }
      //schema ma method cha authentticate->will return true or false
      if (!user.authenticate(password)) {
        return res.status(400).json({
          error: "Email and Password doesnt match",
        });
      }
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      user.hashed_password = undefined;
      user.__v = undefined;
      user.salt = undefined;
      user.createdAt = undefined;
      user.updatedAt = undefined;

      return res.status(200).json({
        token,
        user: user,
      });
    })
    .catch((err) => {
      console.log("ERROR FROM SIGIN IN");
      return res.status(400).json({
        error: err,
      });
    });
};

//change password
exports.changePassword = async (req, res) => {
  const { _id } = req.user;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(_id).exec();
    if (!user)
      return res.status(400).json({
        error: "Something went wrong. Couldn't find the user",
        success: false,
      });
    if (!user.authenticate(oldPassword)) {
      return res.status(400).json({
        error: "Old Password doesnt match",
        success: false,
      });
    }
    user.password = newPassword;

    const updatedUser = await user.save();
    if (!updatedUser) {
      return res
        .status(400)
        .json({ error: "Somthing went wrong", success: false });
    }
    updatedUser.hashed_password = undefined;
    updatedUser.salt = undefined;
    res.status(200).json({
      message: "Successfully changed password",
      data: updatedUser,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      error: err,
      success: false,
    });
  }
};

//new
exports.forgotPassword = (req, res) => {
  const { email } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email does not exist",
      });
    }

    //send email

    const token = jwt.sign(
      { _id: user._id, name: user.name },
      process.env.JWT_RESET_PASSWORD,
      {
        expiresIn: "10m",
      }
    );

    const emailData = {
      from: `atulmdhr@gmail.com`,
      to: `izf.atul@gmail.com`, //email rakhney eta
      subject: `Forgot Password Link`,
      html: `
        <h1>Please use the following link to reset your password</h1>
        <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
        <hr />
        <p>This email may contain sensitive information </p>
        <p>${process.env.CLIENT_URL}</p>
        <p>The Blush Bar</p>
      `,
    };

    return user.updateOne({ resetPasswordLink: token }, (err, success) => {
      if (err) {
        return res.status(400).json({
          error: "Databasde connection error on user forgot password request",
        });
      } else {
        sgMail
          .send(emailData)
          .then((sent) => {
            console.log("Forgot EMAIL SENT", sent);
            console.log("Forgot EMAIL SENT", process.env.EMAIL_TO);
            return res.json({
              message: `Email has been sent to  ${email}. Follow the instructions to activate your account.`,
            });
          })
          .catch((err) => {
            console.log("mail err", err);
            return res.status(400).json({
              error: err,
            });
          });
      }
    });
  });
};
exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;

  if (resetPasswordLink) {
    jwt.verify(
      resetPasswordLink,
      process.env.JWT_RESET_PASSWORD,
      function (err, decoded) {
        if (err) {
          return res.status(400).json({
            error: "Reset Password link expired. Try again",
          });
        }
        User.findOne({ resetPasswordLink }, (err, user) => {
          if (err || !user) {
            return res.status(400).json({
              error: "Something went wrong. Try again.",
            });
          }

          const updatedFields = {
            password: newPassword,
            resetPasswordLink: "",
          };

          user = _.extend(user, updatedFields);

          user.save((err, result) => {
            if (err) {
              return res.status(400).json({
                error: "Error resetting user password. Try again.",
              });
            }
            res.json({
              message: "Great. You can now login with your new password.",
            });
          });
        });
      }
    );
  }
};
