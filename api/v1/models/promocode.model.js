const mongoose = require("mongoose");

const promoCodeModel = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    codeName: { type: String, required: true },
    codeDiscount: { type: Number, required: true },
    minOrder: { type: Number, required: true },
    discountType: {
      type: String,
      enum: ["percent", "amount"],
      required: true,
    },
    message: { type: String, required: true },
    validUpto: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PromoCode", promoCodeModel);
