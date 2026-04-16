const Razorpay = require('razorpay');
const fetch = require('node-fetch') || globalThis.fetch;
require('dotenv').config({path: "c:\\Users\\Aditya\\OneDrive\\Documents\\AdityaProjocts\\E-commerce-backend\\.env"});

async function testAjaxWithOrder() {
  const key_id = (process.env.RAZORPAY_KEY || "").trim();
  const key_secret = (process.env.RAZORPAY_SECRET || "").trim();
  const auth = "Basic " + Buffer.from(key_id + ":" + key_secret).toString("base64");

  const rzp = new Razorpay({ key_id, key_secret });
  
  // 1. Create Order
  const order = await rzp.orders.create({ amount: 50000, currency: "INR", receipt: "test_receipt" });
  console.log("Order created:", order.id);

  // 2. Ping Ajax endpoint with the order_id attached
  const payload = {
    amount: 50000,
    currency: "INR",
    method: "upi",
    contact: "9999999999",
    email: "test@example.com",
    order_id: order.id,
    "_[library]": "checkoutjs"
  };

  const ajaxRes = await fetch("https://api.razorpay.com/v1/payments/create/ajax", {
    method: "POST",
    headers: { "Authorization": auth, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  console.log("Ajax Status:", ajaxRes.status);
  console.log("Ajax Body:", await ajaxRes.text());
}

testAjaxWithOrder();
