const crypto = require("crypto");
const supabase = require("../../config/supabase");

const webhook = async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message: "Missing Razorpay signature",
      });
    }

    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(req.rawBody).digest("hex");

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }
    const event = req.body;

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
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