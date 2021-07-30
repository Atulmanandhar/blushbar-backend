const mongoose = require("mongoose");

const brandSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    brandName: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Brand", brandSchema);
