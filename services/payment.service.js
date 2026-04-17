const razorpay = require("../helper/razorpay");
const crypto = require("crypto");

exports.createOrder = async (amount) => {
  const paise = Math.round(parseFloat(amount) * 100);

  const options = {
    amount: paise,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);
  return order;
};

// ─── Payment Link S2S (generic — netbanking / card fallback) ─────────────────
exports.createS2SPayment = async (payload) => {
  const options = {
    amount: payload.amount,
    currency: payload.currency || "INR",
    accept_partial: false,
    description: "S2S API Order",
    customer: {
      name: payload.email || "Customer",
      email: payload.email,
      contact: payload.contact === "9999999999" ? "9876543210" : (payload.contact || "9876543210")
    },
    notify: { sms: false, email: false }
  };

  const response = await razorpay.paymentLink.create(options);
  return {
    id: response.id,
    currency: response.currency,
    next: [{ url: response.short_url }],
    original: response
  };
};

// ─── Pure UPI Deep Link (NPCI Spec — zero SDK dependency) ────────────────────
// Generates a native upi://pay?... URI that directly opens GPay/PhonePe/BHIM.
// No Razorpay Checkout SDK involved at any step.
// The merchant VPA (pa=) must be your Razorpay-assigned UPI VPA from Dashboard.
exports.createUpiIntentPayment = async ({ amount, contact, email }) => {
  const vpa = (process.env.RAZORPAY_VPA || "").trim();
  const merchantName = (process.env.MERCHANT_NAME || "Store").trim();

  if (!vpa) {
    throw new Error("RAZORPAY_VPA is not set in .env — add your merchant UPI VPA from Razorpay Dashboard");
  }

  // Step 1 — Create a Razorpay Order for payment tracking & webhook reconciliation
  const order = await razorpay.orders.create({
    amount: amount * 100, // paise
    currency: "INR",
    receipt: `upi_${Date.now()}`,
    notes: { contact: contact || "", email: email || "" }
  });

  // Step 2 — Build the standard NPCI UPI deep link
  // Format: upi://pay?pa=VPA&pn=Name&am=Amount&cu=INR&tn=Note&tr=TxnRef
  const params = new URLSearchParams({
    pa: vpa,                          // Payee UPI VPA
    pn: merchantName,                 // Payee Name (shown in UPI app)
    am: (amount).toFixed(2),          // Amount in decimal (e.g., "500.00")
    cu: "INR",                        // Currency — always INR
    tn: `Payment for order ${order.id}`, // Transaction Note
    tr: order.id,                     // Transaction Ref — Razorpay Order ID for reconciliation
  });

  const intent_url = `upi://pay?${params.toString()}`;

  return {
    order_id: order.id,
    intent_url, // upi://pay?pa=...&pn=...&am=...
  };
};

// ─── Signature Verification ──────────────────────────────────────────────────
exports.verifyPaymentSignature = (rawBody, signature, secret) => {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return expectedSignature === signature;
};

// ─── Fetch payment details from Razorpay ────────────────────────────────────
exports.fetchPayment = async (paymentId) => {
  const payment = await razorpay.payments.fetch(paymentId);
  return payment;
};