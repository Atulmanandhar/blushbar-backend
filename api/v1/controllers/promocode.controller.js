let DEBUG;
if (process.env.NODE_ENV === "development") {
  DEBUG = true;
} else {
  DEBUG = false;
}

const mongoose = require("mongoose");
const PromoCode = require("../models/promocode.model");

exports.createPromoCode = async (req, res) => {
  const { codeName, codeDiscount, minOrder, discountType, message, validUpto } =
    req.body;

  const capsCodeName = codeName.toUpperCase();

  const promoCode = new PromoCode({
    _id: new mongoose.Types.ObjectId(),
    codeName: capsCodeName,
    codeDiscount,
    minOrder,
    discountType,
    message,
    validUpto,
  });

  try {
    const checkIfCodeExists = await PromoCode.find({ codeName: capsCodeName });
    if (checkIfCodeExists.length > 0) {
      return res.status(400).json({
        error: "Code with that name already Exists",
        success: false,
      });
    }

    const result = await promoCode.save();
    DEBUG && console.log(result);
    return res.status(201).json({
      message: "Successfully added PromoCode.",
      data: result,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      error: err,
      success: false,
    });
  }
};

exports.updatePromoCode = async (req, res) => {
  const { promoCodeId } = req.params;
  const { codeName, codeDiscount, minOrder, discountType, message, validUpto } =
    req.body;

  let myQuery = {};

  if (!!codeName) {
    const capsCodeName = codeName.toUpperCase();
    myQuery = { ...myQuery, codeName: capsCodeName };
  }
  if (!!codeDiscount) {
    myQuery = { ...myQuery, codeDiscount };
  }
  if (!!minOrder) {
    myQuery = { ...myQuery, minOrder };
  }
  if (!!discountType) {
    myQuery = { ...myQuery, discountType };
  }
  if (!!message) {
    myQuery = { ...myQuery, message };
  }
  if (!!validUpto) {
    myQuery = { ...myQuery, validUpto };
  }

  try {
    const updatedPromoCode = await PromoCode.findByIdAndUpdate(
      { _id: promoCodeId },
      {
        $set: myQuery,
      },
      { new: true }
    ).exec();
    if (!updatedPromoCode)
      return res.status(404).json({
        error:
          "Something went wrong. Please make sure the promoCodeId is correct.",
        success: false,
      });
    res.status(201).json({
      message: `This PromoCode has been sucessfully updated`,
      data: updatedPromoCode,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
};

exports.getPromoCode = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const promoCode = await PromoCode.find()
      .select("-__v")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const promoCodeTotal = await PromoCode.countDocuments().exec();
    res.status(200).json({
      totalDocs: promoCodeTotal,
      total: promoCode.length,
      page: Number(page),
      limit: Number(limit),
      data: promoCode,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
};

exports.deletePromoCodeById = async (req, res) => {
  const { promoCodeId } = req.params;
  try {
    const promoCode = await PromoCode.findById(promoCodeId).exec();
    if (!promoCode) {
      return res.status(404).json({
        error: "The Code with that id couldn't be found",
        success: false,
      });
    }

    const deletedCode = await PromoCode.findByIdAndRemove(promoCodeId).exec();

    return res
      .status(201)
      .json({ message: "Successfully deleted PromoCode", success: true });
  } catch (err) {
    return res.status(500).json({ error: err, success: false });
  }
};
