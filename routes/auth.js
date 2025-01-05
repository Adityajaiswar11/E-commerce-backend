const express = require('express');
const {signup, allUserList} = require('../controllers/auth');
const {login} = require('../controllers/auth');






const  router = express.Router();

router.post("/signup",signup);
router.post("/login",login);
router.get("/user",allUserList);


module.exports=router 