const supabase = require("../../config/supabase");


class CartService {

  async createCart(payload) {
    const { data: cart, error } = await supabase.from("carts").insert(payload).select("*").single();
    if (error) {
      return { error: error.message };
    }
    return { cart };
  }

  async getCart(userId) {
    const { data: cart, error } = await supabase.from("carts").select("id,quantity,price , products(id,name,title,name,desc,image_url)").eq("user_id", userId);
    const tranformedCart = cart.map((item) => {
      return {
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        product_id: item.products.id,
        name: item.products.name,
        title: item.products.title,
        desc: item.products.desc,
        image_url: item.products.image_url
      }
    })
    const total_price = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    if (error) {
      return { error: error.message };
    }
    return { cart:tranformedCart, total_price,total_items:cart.length };
  }

  async updateCart(cartId, quantity) {
    const { data: cart, error } = await supabase.from("carts").update({ quantity }).eq("id", cartId).select("*").single();
    if (error) {
      return { error: error.message };
    }
    return { cart };
  }

  async deleteCart(cartId) {
    const { data: cart, error } = await supabase.from("carts").delete().eq("id", cartId).select("*").single();
    if (error) {
      return { error: error.message };
    }
    return { cart };
  }
}

module.exports = new CartService();