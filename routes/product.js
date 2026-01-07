const express = require('express');
const getProductList = require('../controllers/product');

const router = express.Router();

router.get("/product", getProductList);

module.exports = router 