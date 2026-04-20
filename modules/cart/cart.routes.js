const express = require('express');
const CartController = require('./cart.controller');

const cartRoutes = express.Router();

cartRoutes.post("/cart/create", CartController.addToCart);
cartRoutes.get("/cart/mycart", CartController.getCart);
cartRoutes.put("/cart/update", CartController.updateCart);
cartRoutes.delete("/cart/delete", CartController.deleteCart);

module.exports = cartRoutes;
