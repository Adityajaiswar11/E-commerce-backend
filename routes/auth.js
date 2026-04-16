const express = require('express');
const {signup, allUserList} = require('../controllers/auth');
const {login} = require('../controllers/auth');

const { requireSignin } = require('../middleware/auth');

const  router = express.Router();

router.post("/signup",signup);
router.post("/login",login);

// We add 'requireSignin' in the middle. 
// Now, this route expects a 'Bearer token...' in the Authorization Header!
router.get("/user", requireSignin, allUserList);


module.exports=router 