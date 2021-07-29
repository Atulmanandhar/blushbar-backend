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

  const urlScheme = DEBUG ? req.protocol + "://" : "https://";
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
exports.updateCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { categoryName, usePreviousImage = false } = req.body;
  let checkPrevImgFlag;
  if (usePreviousImage === "true") {
    checkPrevImgFlag = true;
  } else {
    checkPrevImgFlag = false;
  }

  if (req.file === undefined && !checkPrevImgFlag) {
    return res.status(400).json({
      error:
        "Atleast one Image is required. Please send the previous image Link or uploada new one",
      success: false,
    });
  }

  try {
    const category = await Category.findById(categoryId).exec();
    if (!category) {
      // delete the recently storedImage
      const urlScheme = DEBUG ? req.protocol + "://" : "https://";
      const filePath = req.file.path.replace(/\\/g, "/");
      const deleteImageLink = urlScheme + req.headers.host + "/" + filePath;

      ImageRemover(deleteImageLink, "category", req.headers.host);
      return res
        .status(404)
        .json({ error: "The category couldn't be found", success: false });
    }

    let imageToUploadLink = category.categoryImage;
    //if both usePreviousImage = true and image file was sent on the body, we will use the new uploaded image
    // remove the previously stored file.

    if (!!req.file) {
      ImageRemover(category.categoryImage, "category", req.headers.host);
      //create a link for the new file to store in the db
      const urlScheme = DEBUG ? req.protocol + "://" : "https://";
      const filePath = req.file.path.replace(/\\/g, "/");
      const imageToUploadPath = urlScheme + req.headers.host + "/" + filePath;
      imageToUploadLink = imageToUploadPath;
    }

    const myQuery = {
      categoryName,
      categoryImage: imageToUploadLink,
    };

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { $set: myQuery },
      { new: true }
    );

    return res.status(201).json({
      message: "Successfully updated Category.",
      data: updatedCategory,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      error: err,
      success: false,
    });
  }
};
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
