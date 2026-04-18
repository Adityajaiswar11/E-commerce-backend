const paymentService = require("./payment.service");

exports.createOrder = async (req, res) => {
  try {
    const { id, role } = req.user;
    if(role !=="user") return res.status(400).json({ message: "Only users can create orders" });
    const amountInRupees = Number(req.body.amount);

    if (!amountInRupees || isNaN(amountInRupees) || amountInRupees <= 0) {
      return res.status(400).json({ error: "A valid positive amount is required" });
    }
    const { paymentData, message } = await paymentService.createOrder(amountInRupees,id);
    if(message) return res.status(400).json({ message });
    
    // Return 'order' key instead of 'paymentData' so frontend picks it up correctly
    return res.status(201).json({ order: paymentData, key: process.env.RAZORPAY_KEY });
  } catch (error) {
    // Safely extract error from Razorpay object if it lacks a direct .message property
    const errorMessage = error.error?.description || error.message || "An unexpected error occurred";
    return res.status(500).json({ message: errorMessage });
  }
}

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const {paymentData,message} = await paymentService.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (message) {
      return res.status(400).json({ paymentData,message,success:false });
    } else {
      return res.status(200).json({ paymentData, message,success:true });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}