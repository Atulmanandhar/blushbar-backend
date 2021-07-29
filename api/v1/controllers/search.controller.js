let DEBUG;
if (process.env.NODE_ENV === "development") {
  DEBUG = true;
} else {
  DEBUG = false;
}

const Brand = require("../models/brand.model");
const Product = require("../models/product.model");

exports.searchProductAndBrand = async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  let brandMyQuery = {};
  let productMyQuery = {};
  if (/\S/.test(search)) {
    const regex = new RegExp(`.*${search}.*`, "i");
    brandMyQuery = { ...brandMyQuery, brandName: regex };
    productMyQuery = { ...productMyQuery, productName: regex };
  }

  try {
    const brand = await Brand.find(brandMyQuery)
      .select("-__v -createdBy")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const brandTotal = await Brand.countDocuments(brandMyQuery).exec();

    const product = await Product.find(productMyQuery)
      .select("-__v -createdBy")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const productsTotal = await Product.countDocuments(productMyQuery).exec();

    res.status(200).json({
      page: Number(page),
      limit: Number(limit),
      brandData: {
        data: brand,
        total: brand.length,
        totalDocs: brandTotal,
      },
      productData: {
        data: product,
        total: product.length,
        totalDocs: productsTotal,
      },
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
};
