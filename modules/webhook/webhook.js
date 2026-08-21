const crypto = require("crypto");
const supabase = require("../../config/supabase");

const webhook = async (req, res) => {
  try {
    console.log("🔥 WEBHOOK HIT");

    const webhookSignature =
      req.headers["x-razorpay-signature"];

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay signature",
      });
    }

    // IMPORTANT: use RAW body, NOT req.body
    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET
      )
      .update(req.rawBody)
      .digest("hex");

    if (webhookSignature !== expectedSignature) {
      console.log("❌ Invalid signature");

      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    console.log("✅ Signature verified");

    // Express has already parsed this
    const event = req.body;

    console.log("Event:", event.event);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      console.log("💰 Payment captured");
      console.log("Payment ID:", payment.id);
      console.log("Order ID:", payment.order_id);

      const { data, error } = await supabase
        .from("payments")
        .update({
          status: "success",
          metadata: payment,
        })
        .eq("payment_order_id", payment.order_id)
        .select();

      if (error) {
        console.error("Supabase error:", error);

        return res.status(500).json({
          success: false,
          message: "Payment update failed",
        });
      }

      console.log("Payment updated:", data);
    }

    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;

      await supabase
        .from("payments")
        .update({
          status: "failed",
          metadata: payment,
        })
        .eq("payment_order_id", payment.order_id);
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
};

module.exports = webhook;