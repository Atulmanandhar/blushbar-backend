let DEBUG;
if (process.env.NODE_ENV === "development") {
  DEBUG = true;
} else {
  DEBUG = false;
}

const mongoose = require("mongoose");
const Product = require("../models/product.model");
const { ImageRemover } = require("../helpers/ImageRemover");
const _ = require("lodash");

exports.createProduct = async (req, res) => {
  if (req.files === undefined || req.files.length === 0) {
    return res.status(400).json({
      error:
        "Error uploading Images. Please send the correct file format and make sure the size is below 4mb.",
      success: false,
    });
  }
  const { _id } = req.user;
  const {
    productName,
    productPrice,
    productDescription,
    category,
    productBrand,
    showFirstPage,
  } = req.body;

  const capsCategory = category.toUpperCase();
  const capsProductBrand = productBrand.toUpperCase();

  const urlScheme = DEBUG ? req.protocol + "://" : "";
  const productImageLinks = req.files.map((item) => {
    const filePath = item.path.replace(/\\/g, "/");

    return urlScheme + req.headers.host + "/" + filePath;
  });

  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    productName,
    productPrice,
    productDescription,
    productImages: productImageLinks,
    category: capsCategory,
    productBrand: capsProductBrand,
    showFirstPage,
  });

  try {
    const result = await product.save();
    DEBUG && console.log(result);
    return res.status(201).json({
      message: "Successfully added Product.",
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

exports.getProduct = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    showFirstPage = null,
    productBrand = "",
    category = "",
  } = req.query;
  try {
    let myQuery = {};
    console.log(typeof !!showFirstPage, showFirstPage);
    if (!!showFirstPage) {
      myQuery = { showFirstPage };
    }
    if (/\S/.test(productBrand)) {
      myQuery = { ...myQuery, productBrand: productBrand.toUpperCase() };
    }
    if (/\S/.test(category)) {
      myQuery = { ...myQuery, category: category.toUpperCase() };
    }
    const product = await Product.find(myQuery)
      .select("-__v -createdBy")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const productsTotal = await Product.countDocuments(myQuery).exec();
    res.status(200).json({
      totalDocs: productsTotal,
      total: product.length,
      page: Number(page),
      limit: Number(limit),
      data: product,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
};

exports.getProductById = async (req, res) => {
  const { productId } = req.params;
  try {
    const result = await Product.findById(productId).exec();
    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Sorry. Couldn't find the product with that productId",
      });
    }
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
};

exports.deleteProductById = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId).exec();
    if (!product) {
      return res
        .status(404)
        .json({ error: "The product couldn't be found", success: false });
    }

    const deletedProduct = await Product.findByIdAndRemove(productId).exec();
    deletedProduct.productImages.map((oldUrlitem) => {
      ImageRemover(oldUrlitem, "product", req.headers.host);
    });
    return res
      .status(201)
      .json({ message: "Successfully deleted product", success: true });
  } catch (err) {
    return res.status(500).json({ error: err, success: false });
  }
};

//update products by admin (to do)
exports.updateProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId).exec();
    if (!product) {
      return res
        .status(404)
        .json({ error: "The product couldn't be found", success: false });
    }

    const {
      productName,
      productPrice,
      productDescription,
      category,
      productBrand,
      showFirstPage,
      imageUrls,
    } = req.body;

    const urlScheme = DEBUG ? req.protocol + "://" : "";
    let productImageLinks = req.files.map((item) => {
      const filePath = item.path.replace(/\\/g, "/");

      return urlScheme + req.headers.host + "/" + filePath;
    });
    //case 1,if you dont send any imageUrls then all the previously stored images in the server will be deleted
    if (!imageUrls) {
      product.productImages.map((item) => {
        ImageRemover(item, "product", req.headers.host);
      });
    }

    //case 2

    if (imageUrls) {
      //remove uncommon urls from the server
      const uncommonUrls = product.productImages.filter(function (e) {
        return this.indexOf(e) < 0;
      }, imageUrls);
      uncommonUrls.map((itemUrl) => {
        ImageRemover(itemUrl, "product", req.headers.host);
      });
    }

    //urls from the body
    if (imageUrls) {
      productImageLinks = _.concat(imageUrls, productImageLinks);
    }

    if (productImageLinks.length === 0) {
      return res
        .status(409)
        .json({ error: "Atlease 1 image is required", success: false });
    }

    if (productImageLinks.length > 6) {
      productImageLinks.map((imageLink) =>
        ImageRemover(imageLink, "product", req.headers.host)
      );
      return res
        .status(409)
        .json({ error: "Can upload only upto 6 images", success: false });
    }

    //update query
    let myQuery = { productImages: productImageLinks };
    if (productName) {
      myQuery = { ...myQuery, productName };
    }
    if (productPrice) {
      myQuery = { ...myQuery, productPrice };
    }
    if (productDescription) {
      myQuery = { ...myQuery, productDescription };
    }
    if (category) {
      const capsCategory = category.toUpperCase();

      myQuery = { ...myQuery, category: capsCategory };
    }
    if (productBrand) {
      const capsProductBrand = productBrand.toUpperCase();
      myQuery = { ...myQuery, productBrand: capsProductBrand };
    }

    if (showFirstPage) {
      myQuery = { ...myQuery, showFirstPage };
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: myQuery },
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ error: "Product doesn't exist" });
    }

    res.status(201).json({
      message: "Successfully updated Product.",
      data: updatedProduct,
      success: true,
    });
  } catch (err) {
    return res.status(500).json({ error: err, success: false });
  }
};
