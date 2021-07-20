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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);