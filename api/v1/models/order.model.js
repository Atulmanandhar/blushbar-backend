const mongoose = require("mongoose");

const productsSchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const locationSchema = new mongoose.Schema({
  city: { type: String, trim: true },
  address: { type: String, trim: true },
});

const orderSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: { type: String, required: true },
    products: {
      type: [productsSchema],
    },
    totalPrice: {
      type: Number,
      min: 0,
      required: true,
    },
    discountAmount: {
      type: Number,
      min: 0,
      required: true,
    },
    discountCode: {
      type: String,
      required: false,
    },
    subTotal: {
      type: Number,
      min: 0,
      required: true,
    },
    vatTotal: {
      type: Number,
      min: 0,
      required: true,
    },
    deliveryCharge: {
      type: Number,
      min: 0,
      required: true,
    },
    paymentOption: {
      type: String,
      enum: ["esewa", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
    },
    orderDate: { type: Date, required: true },
    orderDescription: { type: String },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "dispatched", "canceled", "completed"],
      default: "pending",
    },
    deliveryAddress: { type: locationSchema, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
