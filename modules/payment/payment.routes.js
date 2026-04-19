const express = require('express');
const paymentController = require('./payment.controller');
const { requireSignin } = require('../../middleware/auth');

const paymentRoutes = express.Router();

paymentRoutes.post("/payment/order", requireSignin, paymentController.createOrder);
paymentRoutes.post("/payment/verify", requireSignin, paymentController.verifyPayment);


module.exports = paymentRoutes;  