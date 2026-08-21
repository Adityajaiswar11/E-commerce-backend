const express = require('express');
const paymentController = require('./payment.controller');
const { isAuthenticated } = require('../../middleware/auth');
const webhook = require('../webhook/webhook');

const paymentRoutes = express.Router();

paymentRoutes.post("/payment/order", isAuthenticated, paymentController.createOrder);
paymentRoutes.post("/payment/verify", isAuthenticated, paymentController.verifyPayment);
paymentRoutes.post("/webhook", webhook);


module.exports = paymentRoutes;  