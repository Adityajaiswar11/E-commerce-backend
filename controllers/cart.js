const Cart = require("../models/cart");
const CartItem = require("../models/cartIem");
const Product = require("../models/productModel");


 const addTocart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user?.id || null; // if logged in
    const guestId = req.guestId;

    //Validate product
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: "Out of stock" });
    }

    //Find or create cart
    let cart = await Cart.findOne({
      status: "active",
      ...(userId ? { userId } : { guestId })
    });

    if (!cart) {
      cart = await Cart.create({
        userId,
        guestId: userId ? null : guestId
      });
    }

    // Add or update cart item
    let item = await CartItem.findOne({
      cartId: cart._id,
      productId
    });

    if (item) {
      const newQty = item.quantity + quantity;

      if (newQty > product.stock) {
        return res.status(400).json({ message: "Stock limit exceeded" });
      }

      item.quantity = newQty;
      await item.save();
    } else {
      await CartItem.create({
        cartId: cart._id,
        productId,
        quantity,
        priceSnapshot: product.price
      });
    }

    // Cart count (for header badge)
    const count = await CartItem.countDocuments({ cartId: cart._id });

    res.json({
      success: true,
      message: "Item added to cart",
      cartItemCount: count
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = addTocart;
