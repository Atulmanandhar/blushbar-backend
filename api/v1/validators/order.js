const { check } = require("express-validator");

exports.createOrderValidator = [
  check("orderDate").notEmpty().withMessage("Order Date is required"),
  check("orderDate").isDate().withMessage("Order Date is wrong format"),
  check("paymentOption").notEmpty().withMessage("Order Date is required"),
  check("paymentOption")
    .isIn(["esewa", "cod"])
    .withMessage("paymentOption can only be of esewa or cod."),
  check("paymentStatus").notEmpty().withMessage("Payment Status is required"),
  check("paymentStatus")
    .isIn(["pending", "paid"])
    .withMessage("paymentOption can only be of pending or paid."),
  check("totalPrice").notEmpty().withMessage("Total Price is required"),
  check("totalPrice").isNumeric().withMessage("Total Price must be a number"),
  check("discountAmount").notEmpty().withMessage("discountAmount is required"),
  check("discountAmount")
    .isNumeric()
    .withMessage("discountAmount must be a number"),
  check("subTotal").notEmpty().withMessage("subTotal is required"),
  check("subTotal").isNumeric().withMessage("subTotal must be a number"),
  check("vatTotal").notEmpty().withMessage("vatTotal is required"),
  check("vatTotal").isNumeric().withMessage("vatTotal must be a number"),
  check("deliveryCharge").notEmpty().withMessage("deliveryCharge is required"),
  check("deliveryCharge")
    .isNumeric()
    .withMessage("deliveryCharge must be a number"),
];

exports.updateOrderStatusValidator = [
  check("orderStatus").notEmpty().withMessage("OrderStatus is required"),
  check("orderStatus")
    .isIn(["pending", "accepted", "canceled", "completed"])
    .withMessage(
      "orderStatus can only be of pending, accepted, canceled or completed."
    ),
  check("paymentStatus")
    .optional()
    .isIn(["pending", "paid"])
    .withMessage("paymentOption can only be of pending or paid."),
];
