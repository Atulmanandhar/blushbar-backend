let DEBUG;
if (process.env.NODE_ENV === "development") {
  DEBUG = true;
} else {
  DEBUG = false;
}

const mongoose = require("mongoose");
const Category = require("../models/category.model");
const { ImageRemover } = require("../helpers/ImageRemover");

exports.createCategory = async (req, res) => {
  if (req.file === undefined) {
    return res.status(400).json({
      error:
        "Error uploading category Image. Please send the correct image format and make sure the size is below 4mb.",
      success: false,
    });
  }
  const { categoryName } = req.body;

  const capsCategoryName = categoryName.toUpperCase();

  const urlScheme = DEBUG ? req.protocol + "://" : "";
  const filePath = req.file.path.replace(/\\/g, "/");

  const categoryImageLink = urlScheme + req.headers.host + "/" + filePath;

  const category = new Category({
    _id: new mongoose.Types.ObjectId(),
    categoryName: capsCategoryName,
    categoryImage: categoryImageLink,
  });

  try {
    const result = await category.save();
    DEBUG && console.log(result);
    return res.status(201).json({
      message: "Successfully added Category.",
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
exports.updateCategory = async (req, res) => {};
exports.getCategory = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const category = await Category.find()
      .select("-__v -createdBy")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const categoryTotal = await Category.countDocuments().exec();
    res.status(200).json({
      totalDocs: categoryTotal,
      total: category.length,
      page: Number(page),
      limit: Number(limit),
      data: category,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
};
exports.deleteCategoryById = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findById(categoryId).exec();
    if (!category) {
      return res
        .status(404)
        .json({ error: "The category couldn't be found", success: false });
    }

    const deletedCategory = await Category.findByIdAndRemove(categoryId).exec();
    ImageRemover(deletedCategory.categoryImage, "category", req.headers.host);

    return res
      .status(201)
      .json({ message: "Successfully deleted Category", success: true });
  } catch (err) {
    return res.status(500).json({ error: err, success: false });
  }
};
