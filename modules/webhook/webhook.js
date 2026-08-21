const express = require("express");
const crypto = require("crypto");


 const webhook = async (req, res) => {
    try {
      const webhookSignature = req.headers["x-razorpay-signature"];

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(req.body)
        .digest("hex");

      if (webhookSignature !== expectedSignature) {
        return res.status(400).json({
          success: false,
          message: "Invalid webhook signature",
        });
      }

      const event = JSON.parse(req.body.toString());

      console.log("Razorpay Event:", event.event);

      // Payment successful
      if (event.event === "payment.captured") {
        const payment = event.payload
        await supabase.from("payments").update({ status: "success", metadata: payment }).eq("payment_order_id", payment.order_id);
      }

      // Payment failed
      if (event.event === "payment.failed") {
        const payment = event.payload;
        await supabase.from("payments").update({ status: "failed", metadata: payment }).eq("payment_order_id", payment.order_id);
      }

      return res.status(200).json({
        success: true,
      });

    } catch (error) {
      console.error("Razorpay webhook error:", error);

      return res.status(500).json({
        success: false,
        message: "Webhook processing failed",
      });
    }
  }

  module.exports = webhook;