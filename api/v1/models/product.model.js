const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    productImages: [{ type: String, required: true }],
    productDescription: { type: String, required: true },
    showFirstPage: { type: Boolean, required: true },
    productBrand: { type: String },
    category: { type: String },
    totalStock: { type: Number, min: 0 },
    isBestSeller: { type: Boolean, required: true },
    isNewArrival: { type: Boolean, required: true },
    isNewLaunch: { type: Boolean, required: true },
    itemCode: { type: String, required: true, unique: true },
    totalSold: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
