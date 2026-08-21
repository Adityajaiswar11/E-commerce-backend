const crypto = require("crypto");
const supabase = require("../../config/supabase");

const webhook = async (req, res) => {
  try {
    console.log("🔥 WEBHOOK HIT");

    console.log("Event:", req.body?.event);

    console.log(
      "Signature:",
      req.headers["x-razorpay-signature"]
    );

    console.log(
      "Raw body exists:",
      !!req.rawBody
    );

    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET
      )
      .update(req.rawBody)
      .digest("hex");

    console.log("Expected:", expectedSignature);
    console.log("Received:", signature);

    if (signature !== expectedSignature) {
      console.log("❌ SIGNATURE FAILED");

      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    console.log("✅ SIGNATURE VERIFIED");

    const event = req.body;

    console.log("EVENT TYPE:", event.event);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      console.log("💰 PAYMENT CAPTURED");
      console.log("Payment:", payment);

      const { data, error } = await supabase
        .from("payments")
        .update({
          status: "success",
          metadata: payment,
        })
        .eq("payment_order_id", payment.order_id)
        .select();

      console.log("Supabase data:", data);
      console.log("Supabase error:", error);
    }

    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;

      console.log("❌ PAYMENT FAILED");

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
    console.error("🔥 WEBHOOK ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = webhook;