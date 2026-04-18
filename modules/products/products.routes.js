const express = require('express');
const upload = require('../../middleware/uploadFile');
const productsController = require('./products.controller');
const { requireSignin } = require('../../middleware/auth');

const router = express.Router();

router.post("/products/upload", requireSignin, upload.single("file"), productsController.uploadProductImage);
router.post("/products/create", requireSignin, productsController.createProduct);


module.exports = router;  