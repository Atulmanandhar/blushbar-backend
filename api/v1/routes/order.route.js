//Routes for all the end users to view different artists and services

const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  changeOrderStatus,
  getOrderById,
  getOrdersByAdmin,
} = require("../controllers/order.controller");

const {
  requireSignin,
  adminMiddleWare,
  subscriberMiddleWare,
} = require("../middleware/auth.middleware");
const { runValidation } = require("../validators/");
const {
  createOrderValidator,
  updateOrderStatusValidator,
} = require("../validators/order");

//create order (subscriber)
router.post(
  "/orders",
  createOrderValidator,
  runValidation,
  requireSignin,
  subscriberMiddleWare,
  createOrder
);

//get own orders (subscriber)
router.get("/orders", requireSignin, subscriberMiddleWare, getOrders);
//get orders by admin
router.get("/admin/orders", requireSignin, adminMiddleWare, getOrdersByAdmin);
//get a particular order by subscriber
router.get(
  "/orders/:orderId",
  requireSignin,
  subscriberMiddleWare,
  getOrderById
);

//accept or reject orders by artist
router.patch(
  "/orders/status/:orderId",
  updateOrderStatusValidator,
  runValidation,
  requireSignin,
  adminMiddleWare,
  changeOrderStatus
);

module.exports = router;
