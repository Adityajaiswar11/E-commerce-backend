const supabase = require("../../config/supabase");

class ProductService {
  
  async uploadProductImage(fileName,fileBuffer,fileMimeType){
      const {error} = await supabase.storage.from("products").upload(fileName, fileBuffer,{
        contentType: fileMimeType,
      });
      if(error) return {message:error.message,status:500};
      const { data } = supabase.storage.from("products").getPublicUrl(fileName);
      return {image_url:data.publicUrl,status:200};
  }

  async createProduct(productData,seller_id){
      const { data:product, error } = await supabase.from("products").insert({...productData,seller_id});
      if (error) {
        return { error:error.message };
      }
    return { product };
  }

  async getAllProducts(search, sort, status, title, page, limit) {
    let query = supabase.from("products").select("*");
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }
    if (sort) {
      query = query.order(sort);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (title) {
      query = query.eq("title", title);
    }
    if (page) {
      query = query.range((page - 1) * limit, page * limit - 1);
    }
    const { data: products, error } = await query;
    const { count } = await supabase.from("products").select("*", { count: "exact" });
    if (error) {
      return { error: error.message };
    }
    return { products, count, current_page: page, per_page: limit, total_pages: Math.ceil(count / limit) };
  }
}

module.exports = new ProductService();