const mongoose = require("mongoose");
const { createHmac } = require("crypto");
//user schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true, max: 32 },
    email: {
      type: String,
      trim: true,
      required: true,
      lowercase: true,
      unique: true,
    },
    hashed_password: { type: String, required: true },
    profilePicture: {
      type: String,
      default: "",
    },
    salt: String,
    role: {
      type: String,
      enum: ["subscriber", "admin"],
      default: "subscriber",
    },
    // resetPasswordLink: {
    //   data: String,
    //   default: "",
    // },
    resetCode: {
      type: Number,
      default: null,
    },
    phoneNumber: { type: Number, default: "0000" },
    isPhoneVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

//virtual
userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

//methods

userSchema.methods = {
  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return createHmac("sha256", this.salt).update(password).digest("hex");
    } catch (err) {
      console.log("yoer", err);
      return "";
    }
  },

  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  },

  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },
};

module.exports = mongoose.model("User", userSchema);
