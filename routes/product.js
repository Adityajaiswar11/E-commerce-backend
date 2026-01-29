const express = require('express');
const getProductList = require('../controllers/product');

const router = express.Router();

router.get("/product", getProductList.getProductList);
router.get("/product/:id", getProductList.getProductById);

module.exports = router 