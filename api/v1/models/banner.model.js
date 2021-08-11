const mongoose = require("mongoose");

const bannerSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    bannerType: { type: String, enum: ["small", "large"], required: true },
    bannerImage: { type: String, required: true },
    promotionType: {
      type: String,
      enum: ["product", "brand"],
      default: "brand",
    },
    brandName: {
      type: String,
      trim: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    message: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Banner", bannerSchema);
