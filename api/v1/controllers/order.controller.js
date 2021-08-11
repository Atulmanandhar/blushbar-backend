let DEBUG;
if (process.env.NODE_ENV === "development") {
  DEBUG = true;
} else {
  DEBUG = false;
}
const mongoose = require("mongoose");

const Order = require("../models/order.model");
const Product = require("../models/product.model");

//subscriber creates a new order
exports.createOrder = async (req, res) => {
  const { _id: susbscriberId } = req.user;
  const {
    products = [],
    orderDate,
    orderDescription,
    paymentStatus,
    paymentOption,
    totalPrice,
    discountAmount,
    discountCode,
    subTotal,
    vatTotal,
    deliveryCharge,
    orderId,
    deliveryAddress,
  } = req.body;

  //validation for existing products

  try {
    if (products.length === 0)
      return res
        .status(404)
        .json({ error: "At least one product must be added", success: false });

    for (let i = 0; i < products.length; i++) {
      const findProduct = await Product.findById(products[i].product).exec();
      if (!findProduct) {
        errCheck = "error";
        return res.status(404).json({
          error: `The Product with id ${products[i].product} doesn't exist`,
          success: false,
        });
      }
      if (findProduct.totalStock < products[i].quantity) {
        errCheck = "error";

        return res.status(400).json({
          error: `Stock insufficient for ${findProduct.productName}`,
          success: false,
        });
      }
    }

    const order = new Order({
      _id: new mongoose.Types.ObjectId(),
      createdBy: susbscriberId,
      products,
      orderDate,
      orderDescription,
      paymentOption,
      paymentStatus,
      totalPrice,
      discountAmount,
      discountCode,
      subTotal,
      vatTotal,
      deliveryCharge,
      orderId,
      deliveryAddress,
    });

    const saveOrder = await order.save();
    saveOrder.__v = undefined;

    // perform update operations

    products.map(async (individualProdId) => {
      try {
        const updateProduct = await Product.findByIdAndUpdate(
          {
            _id: individualProdId.product,
          },
          {
            $inc: { totalStock: -individualProdId.quantity },
          },
          { new: false }
        );
      } catch (err) {
        console.log("update stock of product err", err);
      }
    });

    return res.status(201).json({
      message: "Successfully created a new order",
      data: saveOrder,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({ error: err, success: false });
  }
};

//susbsciber get all your own orders
exports.getOrders = async (req, res) => {
  const { _id } = req.user;
  const { page = 1, limit = 10, status } = req.query;
  let myQuery = { createdBy: _id };

  if (status) {
    if (status.toLowerCase() === "active") {
      myQuery = {
        ...myQuery,
        orderStatus: { $in: ["pending", "confirmed", "dispatched"] },
      };
    }
    if (status.toLowerCase() === "completed") {
      myQuery = { ...myQuery, orderStatus: "completed" };
    }
  }

  try {
    const orderResult = await Order.find(myQuery)
      .populate({
        path: "createdBy",
        select: "-__v -hashed_password -salt -resetPasswordLink",
      })
      .populate({
        path: "products.product",
        select: "-__v",
      })
      .select("-__v")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const orderResultTotal = await Order.countDocuments(myQuery).exec();
    return res.status(200).json({
      totalDocs: orderResultTotal,
      total: orderResult.length,
      page: Number(page),
      limit: Number(limit),
      data: orderResult,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      error: err,
      success: false,
    });
  }
};

exports.getOrdersByAdmin = async (req, res) => {
  const { _id } = req.user;
  const { page = 1, limit = 10, orderStatus } = req.query;
  let myQuery = {};
  if (!!orderStatus) {
    const checkingArray = [
      "pending",
      "confirmed",
      "dispatched",
      "canceled",
      "completed",
    ];
    const checkValueExists = checkingArray.some(
      (item) => item === orderStatus.toLowerCase()
    ); // Returns true or false
    if (checkValueExists) {
      myQuery = { orderStatus };
    }
  }

  try {
    const orderResult = await Order.find(myQuery)
      .populate({
        path: "createdBy",
        select: "-__v -hashed_password -salt -resetPasswordLink",
      })
      .populate({
        path: "products.product",
        select: "-__v",
      })
      .select("-__v")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const orderResultTotal = await Order.countDocuments(myQuery).exec();
    return res.status(200).json({
      totalDocs: orderResultTotal,
      total: orderResult.length,
      page: Number(page),
      limit: Number(limit),
      data: orderResult,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      error: err,
      success: false,
    });
  }
};

//accept or reject orders by admin

exports.changeOrderStatus = async (req, res) => {
  const { _id: admin } = req.user;
  const { orderId } = req.params;
  const { orderStatus, paymentStatus } = req.body;

  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      { $set: { orderStatus: orderStatus, paymentStatus } },
      { new: true }
    ).exec();
    if (!updatedOrder)
      return res.status(404).json({
        error: "Something went wrong. Please make sure the orderId is correct.",
        success: false,
      });

    if (orderStatus === "canceled") {
      updatedOrder.products.map(async (individualProdId) => {
        try {
          const updateProduct = await Product.findByIdAndUpdate(
            {
              _id: individualProdId.product,
            },
            {
              $inc: { totalStock: +individualProdId.quantity },
            },
            { new: false }
          );
        } catch (err) {
          console.log("canceled product err", err);
        }
      });
    }
    if (orderStatus === "completed") {
      updatedOrder.products.map(async (individualProdId) => {
        try {
          const updateProduct = await Product.findByIdAndUpdate(
            {
              _id: individualProdId.product,
            },
            {
              $inc: { totalSold: individualProdId.quantity },
            },
            { new: false }
          );
        } catch (err) {
          console.log("sold product err", err);
        }
      });
    }

    res.status(201).json({
      message: `This order has been sucessfully ${orderStatus}`,
      data: updatedOrder,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({ error: err, success: false });
  }
};

//for only the respective artist and subscriber (TODO)
exports.getOrderById = async (req, res) => {
  const { _id: subscriberId } = req.user;
  const { orderId } = req.params;

  let myQuery = { _id: orderId, createdBy: subscriberId };

  try {
    const order = await Order.findOne(myQuery)
      .populate({
        path: "products.product",
        select: "-__v",
      })
      .select("-__v")
      .exec();
    if (!order)
      return res.status(404).json({
        error: `Sorry. We couldn't find the order ${orderId} for the user ${subscriberId}`,
        success: false,
      });
    if (order.createdBy.toString() !== subscriberId.toString())
      return res.status(404).json({
        error: "You donot have access to this resource",
      });
    res.status(200).json({ data: order, success: true });
  } catch (err) {
    return res.status(500).json({
      error: err,
      success: false,
    });
  }
};
