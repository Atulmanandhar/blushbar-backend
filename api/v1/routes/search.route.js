const router = require("express").Router();

const mongoose = require("mongoose");
const { searchProductAndBrand } = require("../controllers/search.controller");

router.get("/search", searchProductAndBrand);

module.exports = router;


