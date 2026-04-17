const express = require('express');
const {signup, allUserList} = require('../controllers/auth');
const {login} = require('../controllers/auth');

const { requireSignin } = require('../middleware/auth');

const  router = express.Router();

router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.get("/me", requireSignin, allUserList);


module.exports=router 