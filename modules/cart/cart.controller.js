const cartService = require("./cart.service");

class CartController {
  async addToCart(req, res) {
    try {
      if(!req.body.user_id) return res.status(400).json({ message: "User ID is required" });
      if(!req.body.product_id) return res.status(400).json({ message: "Product ID is required" });
      if(!req.body.quantity) return res.status(400).json({ message: "Quantity is required" });
      if(!req.body.price) return res.status(400).json({ message: "Price is required" });

      const { cart, error } = await cartService.createCart(req.body);
      if (error) return res.status(400).json({ message: error, success: false });
      
      return res.status(201).json({ data: cart, success: true });
    } catch (error) {
      return res.status(500).json({ message: error.message, success: false });
    }
  }

  async getCart(req, res) {
    try {

      const { cart, total_price,total_items, error } = await cartService.getCart(5);
      if (error) return res.status(400).json({ message: error, success: false });
      return res.status(200).json({ data: cart, total_price, total_items, success: true });
    } catch (error) {
      return res.status(500).json({ message: error.message, success: false });
    }
  }

  async updateCart(req, res) {
    try {
      if (!req.body.cartId) return res.status(400).json({ message: "Cart ID is required" });
      if (!req.body.quantity) return res.status(400).json({ message: "Quantity is required" });
      const { cart, error } = await cartService.updateCart(req.body.cartId, req.body.quantity);
      if (error) return res.status(400).json({ message: error, success: false });
      return res.status(200).json({ data: cart, success: true });
    } catch (error) {
      return res.status(500).json({ message: error.message, success: false });
    }
  }

  async deleteCart(req, res) {
    try {
      if (!req.body.cart_id) return res.status(400).json({ message: "Cart ID is required" });
      const { cart, error } = await cartService.deleteCart(req.body.cart_id);
      if (error) return res.status(400).json({ message: error, success: false });
      return res.status(200).json({ data: cart, success: true });
    } catch (error) {
      return res.status(500).json({ message: error.message, success: false });
    }
  }
}

module.exports = new CartController();


