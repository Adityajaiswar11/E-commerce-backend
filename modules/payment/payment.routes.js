const express = require('express');
const paymentController = require('./payment.controller');
const { isAuthenticated } = require('../../middleware/auth');

const paymentRoutes = express.Router();

paymentRoutes.post("/payment/order", isAuthenticated, paymentController.createOrder);
paymentRoutes.post("/payment/verify", isAuthenticated, paymentController.verifyPayment);


module.exports = paymentRoutes;  