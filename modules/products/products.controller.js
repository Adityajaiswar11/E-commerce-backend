const productService = require("./product.service");

class ProductController {

  async uploadProductImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: `Invalid file type. Only ${allowedTypes.join(", ")} are allowed.` });
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        return res.status(400).json({ message: "File size exceeds 5MB limit" });
      }
    
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const fileBuffer = req.file.buffer;
      const fileMimeType = req.file.mimetype;
      const { image_url } = await productService.uploadProductImage(fileName,fileBuffer,fileMimeType);
      return res.status(200).json({image_url});
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async createProduct(req, res) {
    try {
      const { name, title, desc, price, stock } = req.body;
      const { id, role } = req.user;
      if(role === "user") return res.status(400).json({ message: "Only sellers can create products" });
      if(!name || !title || !desc || !price || !stock) return res.status(400).json({ message: "No product data provided" });
      const { product } = await productService.createProduct(req.body,id);

      return res.status(201).json({ product});
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ProductController();