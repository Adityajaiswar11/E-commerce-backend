const Order = require("../models/payment/order");
const paymentService = require("../services/payment.service");
const razorpay = require("../utils/razorpay");

exports.createPaymentOrder = async (req, res) => {
  try {
    const user_id = req.user._id;
    const amount = parseFloat(req.body.amount);

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "A valid positive amount is required" });
    }
    // Create the order on Razorpay
    const razorpayOrder = await paymentService.createOrder(amount);

    // Save initial state in the Database
    const newOrder = new Order({
      order_id: razorpayOrder.id,
      user_id: user_id,
      amount: amount,
      payment_status: 1,
      currency: razorpayOrder.currency,
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ error: "Could not create Razorpay order" });
  }
};

exports.createS2SPayment = async (req, res) => {
  try {
    const { amount, method, bank, card, email, contact } = req.body;
    const user_id = req.user._id;

    if (!amount || !method) {
      return res.status(400).json({ error: "amount and method are required" });
    }

    const payload = {
      amount: amount * 100, // paise
      currency: "INR",
      email: email || "test@example.com",
      contact: contact || "9999999999",
      method: method
    };

    if (method === "upi") {
      payload.upi = { flow: "intent" };
    } else if (method === "netbanking") {
      if (!bank) return res.status(400).json({ error: "bank code required for netbanking" });
      payload.bank = bank;
    } else if (method === "card") {
      if (!card || !card.name || !card.number || !card.expiry_month || !card.expiry_year || !card.cvv) {
        return res.status(400).json({ error: "incomplete card details" });
      }
      payload.card = card;
    } else {
      return res.status(400).json({ error: "unsupported payment method" });
    }

    // Ping Razorpay S2S directly without creating a generic Order first
    const rzpResponse = await paymentService.createS2SPayment(payload);

    let action_url = null;
    if (rzpResponse.next && rzpResponse.next[0] && rzpResponse.next[0].url) {
      action_url = rzpResponse.next[0].url;
    }

    // Save initial state in the Database
    const newOrder = new Order({
      order_id: `s2s_${Date.now()}`, // Provide dummy order_id because pure S2S payments lack one
      payment_id: rzpResponse.id,
      user_id: user_id,
      amount: amount,
      payment_status: 1,
      currency: rzpResponse.currency,
      payment_status: 1
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      payment: rzpResponse,
      action_url: action_url
    });
  } catch (error) {
    console.error("Create S2S Payment Error:", error);
    res.status(500).json({ error: "Could not create Razorpay S2S payment" });
  }
};

exports.razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!paymentService.verifyPaymentSignature(req.rawBody, signature, webhookSecret)) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const payload = req.body;
    const event = payload.event;

    if (event === "payment.captured") {
      const paymentEntity = payload.payload.payment.entity;
      const paymentId = paymentEntity.id;
      const rzpOrderId = paymentEntity.order_id;
      const pLinkId = paymentEntity.payment_link_id;
      const method = paymentEntity.method; // e.g., 'upi', 'card', 'netbanking'

      // We look for standard orders, S2S payment links, or raw S2S payments gracefully
      const query = rzpOrderId ? { order_id: rzpOrderId } : (pLinkId ? { payment_id: pLinkId } : { payment_id: paymentId });

      // Update Order document to success
      await Order.findOneAndUpdate(
        query,
        {
          payment_status: 2, // 2=success in your new schema
          method: method
        }
      );
      console.log(`Payment successful and verified for payment_id ${paymentId}`);
    } else if (event === "payment.failed") {
      const failedEntity = payload.payload.payment.entity;
      const paymentId = failedEntity.id;
      const rzpOrderId = failedEntity.order_id;
      const pLinkId = failedEntity.payment_link_id;

      const query = rzpOrderId ? { order_id: rzpOrderId } : (pLinkId ? { payment_id: pLinkId } : { payment_id: paymentId });

      await Order.findOneAndUpdate(
        query,
        { payment_status: 3 } // 3=failed
      );
      console.log(`Payment failed for payment_id ${paymentId}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // We verify the signature using the Razorpay secret from our .env
    const secret = process.env.RAZORPAY_SECRET;

    // The raw body formula for frontend verification is order_id + "|" + payment_id
    const generated_signature = require("crypto")
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
    // Fetch payment from Razorpay to capture the custom method (UPI, Card, etc)
    const payment = await paymentService.fetchPayment(razorpay_payment_id);
    if (generated_signature !== razorpay_signature) {
      await Order.findOneAndUpdate(
        { order_id: razorpay_order_id },
        {
          payment_status: 3, // 3=failed
          payment_id: razorpay_payment_id,
          payment_method: payment.method
        }
      );
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // Update the database immediately for snappy frontend feedback!
    await Order.findOneAndUpdate(
      { order_id: razorpay_order_id },
      {
        payment_status: 2, // 2=success 
        payment_id: razorpay_payment_id,
        payment_method: payment.method
      }
    );

    res.status(200).json({ success: true, message: "Payment successfully verified!" });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, message: "Server error during verification" });
  }
};

// ─── POST /api/payment/upi-intent ────────────────────────────────────────────
// Creates a Razorpay Order + S2S UPI Intent and returns the deep link to the frontend.
// Frontend opens intent_url on mobile → UPI app launches → user pays → webhook fires.
exports.createUpiIntent = async (req, res) => {
  try {
    const { amount, contact, email } = req.body;
    const user_id = req.user._id;

    if (!amount) {
      return res.status(400).json({ error: "amount is required" });
    }

    const result = await paymentService.createUpiIntentPayment({ amount, contact, email });

    // Persist a pending order in our DB tracked by order_id (webhook will update by order_id)
    const newOrder = new Order({
      order_id: result.order_id,
      user_id,
      amount,
      currency: "INR",
      payment_status: 1 // 1=pending
    });

    await newOrder.save();

    return res.status(201).json({
      success: true,
      order_id: result.order_id,
      intent_url: result.intent_url // upi://pay?pa=...&pn=...&am=...&cu=INR&tr=order_id
    });
  } catch (error) {
    console.error("UPI Intent Error:", error.message);
    res.status(500).json({ error: error.message || "Could not create UPI intent" });
  }
};

// ─── GET /api/payment/status/:paymentId ──────────────────────────────────────
// Polled by the frontend every ~2s after opening the UPI intent URL.
// Checks our DB first (fastest); falls back to Razorpay API if still pending.
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // paymentId can be either a Razorpay payment_id (pay_xxx) or an order_id (order_xxx)
    const isOrderId = paymentId.startsWith("order_");

    // 1. Check DB first — updated by webhook asynchronously
    const order = await Order.findOne(
      isOrderId ? { order_id: paymentId } : { payment_id: paymentId }
    );

    if (order) {
      if (order.payment_status === 2) return res.json({ status: "captured", order_id: order.order_id });
      if (order.payment_status === 3) return res.json({ status: "failed", order_id: order.order_id });
    }

    // 2. Fallback: query Razorpay API directly
    if (isOrderId) {
      // For UPI deep link flow — fetch payments for this order
      const orderPayments = await razorpay.orders.fetchPayments(paymentId);
      const items = orderPayments.items || [];
      const captured = items.find(p => p.status === "captured");
      const failed = items.find(p => p.status === "failed");

      if (captured) {
        await Order.findOneAndUpdate(
          { order_id: paymentId },
          { payment_status: 2, payment_id: captured.id, payment_method: captured.method }
        );
        return res.json({ status: "captured", order_id: paymentId, payment_id: captured.id });
      }
      if (failed) {
        await Order.findOneAndUpdate({ order_id: paymentId }, { payment_status: 3 });
        return res.json({ status: "failed", order_id: paymentId });
      }
      return res.json({ status: "created" }); // still waiting
    } else {
      // For standard flow — fetch payment directly
      const rzpPayment = await paymentService.fetchPayment(paymentId);
      if (rzpPayment.status === "captured" && order) {
        await Order.findOneAndUpdate(
          { payment_id: paymentId },
          { payment_status: 2, payment_method: rzpPayment.method }
        );
      } else if (rzpPayment.status === "failed" && order) {
        await Order.findOneAndUpdate({ payment_id: paymentId }, { payment_status: 3 });
      }
      return res.json({ status: rzpPayment.status });
    }
  } catch (error) {
    console.error("Status Poll Error:", error.message);
    res.status(500).json({ error: "Could not fetch payment status" });
  }
};

