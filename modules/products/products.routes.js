const express = require('express');
const upload = require('../../middleware/uploadFile');
const productsController = require('./products.controller');
const { requireSignin } = require('../../middleware/auth');

const productsRoutes = express.Router();

productsRoutes.post("/products/upload", requireSignin, upload.single("file"), productsController.uploadProductImage);
productsRoutes.post("/products/create", requireSignin, productsController.createProduct);


module.exports = productsRoutes;  