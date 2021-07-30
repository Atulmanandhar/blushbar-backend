let DEBUG;
if (process.env.NODE_ENV === "development") {
  DEBUG = true;
} else {
  DEBUG = false;
}

const mongoose = require("mongoose");
const Brand = require("../models/brand.model");

exports.createBrand = async (req, res) => {
  const { brandName } = req.body;

  const capsBrandName = brandName.toUpperCase();

  const brand = new Brand({
    _id: new mongoose.Types.ObjectId(),
    brandName: capsBrandName,
  });

  try {
    const checkIfBrandExists = await Brand.find({ brandName: capsBrandName });
    if (checkIfBrandExists.length > 0) {
      return res.status(400).json({
        error: "Brand with that name already Exists",
        success: false,
      });
    }
    const result = await brand.save();
    DEBUG && console.log(result);
    return res.status(201).json({
      message: "Successfully added Brand.",
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
exports.updateBrand = async (req, res) => {
  const { brandId } = req.params;
  const { brandName } = req.body;
  const capsBrandName = brandName.toUpperCase();
  try {
    const updatedBrand = await Brand.findByIdAndUpdate(
      { _id: brandId },
      {
        $set: { brandName: capsBrandName },
      },
      { new: true }
    ).exec();
    if (!updatedBrand)
      return res.status(404).json({
        error: "Something went wrong. Please make sure the brandId is correct.",
        success: false,
      });
    res.status(201).json({
      message: `This Brand has been sucessfully updated`,
      data: updatedBrand,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
};
exports.getBrand = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  let myQuery = {};
  if (/\S/.test(search)) {
    const regex = new RegExp(`.*${search}.*`, "i");
    myQuery = { ...myQuery, brandName: regex };
  }
  try {
    const brand = await Brand.find(myQuery)
      .select("-__v -createdBy")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const brandTotal = await Brand.countDocuments(myQuery).exec();
    res.status(200).json({
      totalDocs: brandTotal,
      total: brand.length,
      page: Number(page),
      limit: Number(limit),
      data: brand,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
};

exports.deleteBrandById = async (req, res) => {
  const { brandId } = req.params;
  try {
    const brand = await Brand.findById(brandId).exec();
    if (!brand) {
      return res
        .status(404)
        .json({ error: "The Brand couldn't be found", success: false });
    }

    const deletedBrand = await Brand.findByIdAndRemove(brandId).exec();

    return res
      .status(201)
      .json({ message: "Successfully deleted Brand", success: true });
  } catch (err) {
    return res.status(500).json({ error: err, success: false });
  }
};
