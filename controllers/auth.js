const {comparePassword,hashPassword} = require("../helper/auth");

const User = require("../models/user");
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  //validation for name email and password
  if (!name) {
    return res.status(400).send("Please enter your name");
  }

  if (!email) {
    return res.status(400).send("Please enter your email");
  }

  if (!password) {
    return res.status(400).send("Please enter your password");
  }
  //check if email already exists
  const isEmailexit = await User.findOne({ email });
  if (isEmailexit) {
    return res.status(400).send("Email is already exists!");
  }
  const  hashNewPassword = await hashPassword(password)
  const user = new User({ name, email, password:hashNewPassword });

  try{
    const savedUser = await user.save();
    console.log(savedUser)
    res.status(201).json({message:"Successfully Registered"});
    
  }catch(err){
    console.log(err);
    res.status(400).send("Internal server error")
  }
  

};
module.exports.signup = signup;

const login = (req,res)=>{
  
  const{email,password}=req.body
  User.findOne({email})
      .then((user)=>
        {
          if(!user) return res.status(400).send('Invalid Email or Password')
          
          const validPass=comparePassword(password,user.password)
          if(!validPass) return res.status(400).send('Invalid Email or Password')
          //create and assign a token
          const token=jwt.sign({_id:user._id},process.env.SECRET)
          //return jsonwebtoken in the response header
          res.header('auth-token',token).send(token)
        })
      .catch(err=>{console.log(err)})
}
  
module.exports.login = login;
