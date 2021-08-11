let DEBUG;
if (process.env.NODE_ENV === "development") {
  DEBUG = true;
} else {
  DEBUG = false;
}

const Banner = require("../models/banner.model");
const mongoose = require("mongoose");
const { ImageRemover } = require("../helpers/ImageRemover");

exports.createBanner = async (req, res) => {
  if (req.file === undefined) {
    return res.status(400).json({
      error:
        "Error uploading banner Image. Please send the correct image format and make sure the size is below 4mb.",
      success: false,
    });
  }
  const { bannerType, promotionType, brandName, product, message } = req.body;

  const urlScheme = DEBUG ? req.protocol + "://" : "https://";
  const filePath = req.file.path.replace(/\\/g, "/");

  const bannerImageLink = urlScheme + req.headers.host + "/" + filePath;

  let banner;
  if (promotionType === "product") {
    banner = new Banner({
      _id: new mongoose.Types.ObjectId(),
      bannerType,
      bannerImage: bannerImageLink,
      promotionType,
      message,
      product,
    });
  } else {
    banner = new Banner({
      _id: new mongoose.Types.ObjectId(),
      bannerType,
      bannerImage: bannerImageLink,
      promotionType,
      message,
      brandName,
    });
  }

  try {
    const result = await banner.save();
    return res.status(201).json({
      message: "Successfully added banner.",
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
exports.deleteBanner = async (req, res) => {
  const { bannerId } = req.params;
  try {
    const banner = await Banner.findById(bannerId).exec();
    if (!banner) {
      return res
        .status(404)
        .json({ error: "The banner couldn't be found", success: false });
    }

    const deletedBanner = await Banner.findByIdAndRemove(bannerId).exec();
    ImageRemover(deletedBanner.bannerImage, "banner", req.headers.host);

    return res
      .status(201)
      .json({ message: "Successfully deleted Banner", success: true });
  } catch (err) {
    return res.status(500).json({ error: err, success: false });
  }
};
exports.getBanner = async (req, res) => {
  const { page = 1, limit = 10, bannerType } = req.query;
  let myQuery = {};
  if (bannerType) {
    if (
      bannerType.toLowerCase() === "small" ||
      bannerType.toLowerCase() === "large"
    ) {
      myQuery = { bannerType: bannerType.toLowerCase() };
    }
  }

  try {
    const bannerResult = await Banner.find(myQuery)
      .select("-__v -createdBy")
      .populate("product")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const bannerTotal = await Banner.find(myQuery).countDocuments().exec();
    res.status(200).json({
      totalDocs: bannerTotal,
      total: bannerResult.length,
      page: Number(page),
      limit: Number(limit),
      data: bannerResult,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      error: err,
      success: false,
    });
  }
};
exports.editBanner = async (req, res) => {
  const { bannerId } = req.params;
  const {
    bannerType,
    promotionType,
    brandName,
    product,
    message,
    usePreviousImage = false,
  } = req.body;
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
    const banner = await Banner.findById(bannerId).exec();

    if (!banner) {
      // delete the recently storedImage
      const urlScheme = DEBUG ? req.protocol + "://" : "https://";
      const filePath = req.file.path.replace(/\\/g, "/");
      const deleteImageLink = urlScheme + req.headers.host + "/" + filePath;

      ImageRemover(deleteImageLink, "banner", req.headers.host);
      return res
        .status(404)
        .json({ error: "The banner couldn't be found", success: false });
    }

    let imageToUploadLink = banner.bannerImage;
    //if both usePreviousImage = true and image file was sent on the body, we will use the new uploaded image
    // remove the previously stored file.

    if (!!req.file) {
      ImageRemover(banner.bannerImage, "banner", req.headers.host);
      //create a link for the new file to store in the db
      const urlScheme = DEBUG ? req.protocol + "://" : "https://";
      const filePath = req.file.path.replace(/\\/g, "/");
      const imageToUploadPath = urlScheme + req.headers.host + "/" + filePath;
      imageToUploadLink = imageToUploadPath;
    }

    let myQuery = {
      bannerImage: imageToUploadLink,
    };
    if (bannerType) {
      myQuery = { ...myQuery, bannerType };
    }
    if (promotionType && promotionType === "product") {
      if (product) {
        myQuery = { ...myQuery, promotionType, product };
      } else {
        myQuery = { ...myQuery, promotionType };
      }
    }

    if (promotionType && promotionType === "brand") {
      if (brandName) {
        myQuery = { ...myQuery, promotionType, brandName };
      } else {
        myQuery = { ...myQuery, promotionType };
      }
    }

    if (message) {
      myQuery = { ...myQuery, message };
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
      bannerId,
      { $set: myQuery },
      { new: true }
    );

    return res.status(201).json({
      message: "Successfully updated Banner.",
      data: updatedBanner,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      error: err,
      success: false,
    });
  }
};
