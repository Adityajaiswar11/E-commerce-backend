const express = require('express');
const upload = require('../../middleware/uploadFile');
const productsController = require('./products.controller');
const { isAuthenticated } = require('../../middleware/auth');

const productsRoutes = express.Router();

productsRoutes.post("/products/upload", isAuthenticated, upload.single("file"), productsController.uploadProductImage);
productsRoutes.post("/products/create", isAuthenticated, productsController.createProduct);
productsRoutes.get("/products", productsController.getAllProducts);


module.exports = productsRoutes;  