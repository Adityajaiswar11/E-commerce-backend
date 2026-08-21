const crypto = require("crypto");
const supabase = require("../../config/supabase");

const webhook = async (req, res) => {
  try {
    console.log("🔥 RAZORPAY WEBHOOK HIT");
    const webhookSignature = req.headers["x-razorpay-signature"];

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay signature",
      });
    }

    // req.body MUST be a Buffer
    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET
      )
      .update(req.body)
      .digest("hex");

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    // Convert raw Buffer to JSON
    const event = JSON.parse(req.body.toString("utf8"));

    console.log("Razorpay Event:", event.event);

    // =========================
    // PAYMENT CAPTURED
    // =========================

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      console.log("Payment ID:", payment.id);
      console.log("Order ID:", payment.order_id);

      const { error } = await supabase
        .from("payments")
        .update({
          status: "success",
          metadata: payment,
        })
        .eq("payment_order_id", payment.order_id);

      if (error) {
        console.error("Supabase update error:", error);

        return res.status(500).json({
          success: false,
          message: "Failed to update payment",
        });
      }
    }

    // =========================
    // PAYMENT FAILED
    // =========================

    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;

      console.log("Payment failed:", payment.id);
      console.log("Order ID:", payment.order_id);

      const { error } = await supabase
        .from("payments")
        .update({
          status: "failed",
          metadata: payment,
        })
        .eq("payment_order_id", payment.order_id);

      if (error) {
        console.error("Supabase update error:", error);

        return res.status(500).json({
          success: false,
          message: "Failed to update payment",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });

  } catch (error) {
    console.error("Razorpay webhook error:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};

module.exports = webhook;