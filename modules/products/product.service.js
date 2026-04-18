const supabase = require("../../config/supabase");

class ProductService {
  
  async uploadProductImage(fileName,fileBuffer,fileMimeType){
    try {
      const {error} = await supabase.storage.from("products").upload(fileName, fileBuffer,{
        contentType: fileMimeType,
      });
      if(error) return {message:error.message,status:500};
      const { data } = supabase.storage.from("products").getPublicUrl(fileName);
      return {image_url:data.publicUrl,status:200};
    } catch (error) {
      return {message:error.message,status:500};
    }
  }

  async createProduct(productData,seller_id){
    try {
      const { data:product, error } = await supabase.from("products").insert({...productData,seller_id});
      if (error) {
        return { error:error.message };
      }
      return { product};
    } catch (error) {
      return { message: error.message };
    }
  }
}

module.exports = new ProductService();