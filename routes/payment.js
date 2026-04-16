const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');
const { requireSignin } = require('../middleware/auth');

// Endpoint to create a Standard Razorpay Order (Front-end SDK decides method)
router.post('/payment/create-order', requireSignin, paymentController.createPaymentOrder);

// Endpoint to create a Server-to-Server Direct Payment Intent (Backend S2S)
router.post('/payment/create-s2s', requireSignin, paymentController.createS2SPayment);

// ─── UPI Intent S2S (mobile deep link) ───────────────────────────────────────
// Frontend calls this → gets intent_url → opens UPI app (GPay/PhonePe/BHIM)
router.post('/payment/upi-intent', requireSignin, paymentController.createUpiIntent);

// Status polling — frontend polls this every 2s until captured or failed
router.get('/payment/status/:paymentId', requireSignin, paymentController.getPaymentStatus);

// Webhook endpoint
// Handles notifications from Razorpay server-to-server for capturing success/failure of payments.
router.post('/payment/webhook', paymentController.razorpayWebhook);

// Frontend Verification endpoint
// Your frontend calls this IMMEDIATELY after the payment window succeeds
router.post('/payment/verify', requireSignin, paymentController.verifyPayment);

module.exports = router;
