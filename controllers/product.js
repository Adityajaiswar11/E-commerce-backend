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

module.exports = getProductList
