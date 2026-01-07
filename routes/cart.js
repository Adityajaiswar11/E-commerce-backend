const express = require('express');
const addTocart = require('../controllers/cart');
const guestMiddleware = require('../middleware/guest/checkGuest');

const  router = express.Router();

router.post("/cart",guestMiddleware,addTocart);



module.exports=router 