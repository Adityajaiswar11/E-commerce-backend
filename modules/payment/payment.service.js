const supabase = require("../../config/supabase");
const razorpay = require("../../utils/razorpay");
const crypto = require("crypto");

class PaymentService {
  
  async createOrder(amount,userId) {
    try {
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });
      
      const {data:paymentData} = await supabase.from("payments").insert({
        payment_order_id: order.id,
        amount: order.amount / 100,
        currency: order.currency,
        receipt: order.receipt,
        status: "pending",
        user_id: userId,
      }).select("*").single();
      return { paymentData};
    } catch (error) {
      // Razorpay throws objects containing .error.description instead of standard Errors
      const errorMessage = error.error?.description || error.message || "Failed to create Razorpay order";
      return { message: errorMessage };
    }
  }

  async verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature) {
    const secret = process.env.RAZORPAY_SECRET;
    const generated_signature = crypto.createHmac("sha256", secret).update(razorpay_order_id + "|" + razorpay_payment_id).digest("hex");
    
    // ─── Fetch payment details from Razorpay ────────────────────────────────────
    const payment = await this.fetchPayment(razorpay_payment_id);
    
    if(generated_signature === razorpay_signature){
      const {data:paymentData} = await supabase.from("payments").update({ status: "success", payment_method: payment.method, payment_id: razorpay_payment_id }).eq("payment_order_id", razorpay_order_id).select("*").single();
      return { paymentData };
    } else {
      const {data:paymentData} = await supabase.from("payments").update({ status: "failed", payment_method: payment.method, payment_id: razorpay_payment_id }).eq("payment_order_id", razorpay_order_id).select("*").single();
      return { paymentData };
    }
  }

  // ─── Fetch payment details from Razorpay ────────────────────────────────────
  async fetchPayment(paymentId) {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  }
}

module.exports = new PaymentService();

