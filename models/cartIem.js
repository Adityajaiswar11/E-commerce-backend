const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
      index: true
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    priceSnapshot: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "INR"
    }
  },
  { timestamps: true }
);

//prevent duplicate item
cartItemSchema.index(
  { cartId: 1, productId: 1 },
  { unique: true }
);

const CartItem = mongoose.model("CartItem", cartItemSchema); 
module.exports = CartItem;


