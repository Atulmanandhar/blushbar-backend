const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const sgMail = require("@sendgrid/mail");
const _ = require("lodash");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
        to: process.env.EMAIL_TO,
        subject: `Account activation Link`,
        html: `
          <h2>Please use the following link to activate your account</h2>
          <a href="${process.env.CLIENT_URL}/api/v1/account-activation/${token}"><h1>Activate your account</h1></a>
          <hr />
          <p>This email may contain sensitive information </p>
          <p>The Blush Bar</p>
        `,
      };

      sgMail
        .send(emailData)
        .then((sent) => {
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
      return res.status(400).json({
        error: err,
        success: false,
      });
    });
};

exports.accountActivation = async (req, res) => {
  // const { token } = req.body;

  const { token } = req.params;
  if (token) {
    jwt.verify(
      token,
      process.env.JWT_ACCOUNT_ACTIVATION,
      async function (err, decoded) {
        if (err) {
          return res.redirect(
            `${process.env.CLIENT_URL}/api/v1/failure?err=Link has expired. Please Signup again`
          );
        }
        const { name, email, password, phoneNumber } = jwt.decode(token);

        const checkUser = await User.findOne({ email }).exec();

        if (checkUser !== null) {
          //422 unprocessable entity,409 confilct error
          return res.redirect(
            `${process.env.CLIENT_URL}/api/v1/failure?err=Account has already been activated. You can log in the app`
          );
        }

        const user = new User({ name, email, password, phoneNumber });
        user
          .save()
          .then(() => {
            // return res.json({
            //   message: "Signup success. Please signin.",
            // });
            return res.redirect(`${process.env.CLIENT_URL}/api/v1/success`);
          })
          .catch((err) => {
            console.log("Save user in account activation error", err);

            return res.redirect(`${process.env.CLIENT_URL}/api/v1/failure`);
          });
      }
    );
  } else {
    return res.json({
      message: "Something went wrong. Try again.",
      success: false,
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
          error: "User with that email doesnt exist",
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
      user.resetCode = undefined;
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

    //4 digit number
    const resetCode = Math.floor(Math.random() * 8999 + 1000);

    const emailData = {
      from: `atulmdhr@gmail.com`,
      to: process.env.EMAIL_TO, //email rakhney eta
      subject: `Forgot Password Link`,
      html: `
        <h2>Please use the following code in your mobile app to reset the password:</h2>
        <h1>${resetCode}</h1>
        <hr />
        <p>This email may contain sensitive information </p>
        <p>The Blush Bar</p>
      `,
    };

    return user.updateOne({ resetCode }, (err, success) => {
      if (err) {
        return res.status(400).json({
          error: "Databasde connection error on user forgot password request",
        });
      } else {
        sgMail
          .send(emailData)
          .then((sent) => {
            // console.log("Forgot EMAIL SENT", sent);
            // console.log("Forgot EMAIL SENT", process.env.EMAIL_TO);
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
exports.resetPassword = async (req, res) => {
  const { resetCode, newPassword, email } = req.body;
  try {
    const user = await User.findOne({ email, resetCode }).exec();
    if (user === null) {
      return res.status(404).json({
        error: "Invalid Code. Please try again",
        success: false,
      });
    }

    user.password = newPassword;
    user.resetCode = null;

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
  } catch (err) {
    return res.status(500).json({
      error: err,
      success: false,
    });
  }
};

exports.success = (req, res) => {
  res.send("<p>Account successfully created.You can now sigin the app</p>");
};
exports.failure = (req, res) => {
  const { err = "Somthing went wrong try again later" } = req.query;
  res.send(`<p>${err}</p>`);
};

exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;
  try {
    const response = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email_verified, name, email } = response.payload;
    if (email_verified) {
      const user = await User.findOne({ email }).exec();

      if (user) {
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });
        user.hashed_password = undefined;
        user.resetCode = undefined;
        user.__v = undefined;
        user.salt = undefined;
        user.createdAt = undefined;
        user.updatedAt = undefined;
        return res.status(200).json({
          token,
          user: user,
          success: true,
        });
      } else {
        //generate a random password (userModel requires a password)
        let password = email + process.env.JWT_SECRET;
        const newUser = new User({ name, email, password });
        const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, {
          expiresIn: "7d",
        });

        newUser.save((err, data) => {
          if (err) {
            return res.status(500).json({
              error: err,
              success: false,
            });
          }
          data.hashed_password = undefined;
          data.resetCode = undefined;
          data.__v = undefined;
          data.salt = undefined;
          data.createdAt = undefined;
          data.updatedAt = undefined;
          return res.json({
            token,
            user: data,
            success: true,
          });
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      error: err,
      success: false,
    });
  }
};
