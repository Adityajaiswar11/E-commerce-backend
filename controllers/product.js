const Product = require("../models/productModel");

const getProductList = async (req, res) => {
  try {
    const { search,sortby,filterby,orderby='asc',limit} = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];

      // if search is a number → search by price
      if (!isNaN(search)) {
        filter.$or.push({ price: Number(search) });
      }
    }
    

    if(filterby){
      filter.category = { $regex:filterby , $options: "i" }; 
    }

    const sort = {
      [sortby]: orderby === "asc" ? 1 : -1
    };

    const products = await Product.find(filter).sort(sort).limit(Number(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getProductById = async(req,res)=>{
    try {
      const {id} = req.params;
      if(!id)return res.status(400).json({success:false,message:"Invalid ID"});
      const product = await Product.findById(id);
      if(!product)return res.status(404).json({success:false,message:"Product not found"});
      return res.status(200).json({success:true,data:product});
    } catch (error) {
      return res.status(500).json({success:false,message:error.message});
    }
}
module.exports = {getProductList,getProductById}
