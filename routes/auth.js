const express = require('express');
const {signup} = require('../controllers/auth');
const {login} = require('../controllers/auth');
const {userId} = require('../controllers/auth');





const  router = express.Router();

router.post("/signup",signup);
router.post("/login",login)
router.get("/user/:userId",userId)


module.exports=router 