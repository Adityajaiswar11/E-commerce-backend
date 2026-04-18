const express = require('express');
const paymentController = require('./payment.controller');
const { requireSignin } = require('../../middleware/auth');

const router = express.Router();

router.post("/payment/order", requireSignin, paymentController.createOrder);
router.post("/payment/verify", requireSignin, paymentController.verifyPayment);


module.exports = router;  