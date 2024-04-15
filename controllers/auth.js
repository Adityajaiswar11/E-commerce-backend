const { hashPassword } = require("../helper/auth");
const { comparePassword } = require("../helper/auth");
const User = require("../models/user");

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
    return res.status(400).send("Email is already registered!");
  }
  const hashNewPassword = await hashPassword(password);
  const user = new User({ name, email, password: hashNewPassword });

  try {
    await user.save();
    return res.json({ user });
  } catch (err) {
    console.log(err);
    res.status(400).send("something went wrong ! try again");
  }
};

const login = (req, res) => {
  const { email, password } = req.body;
  console.log(email,password)
  User.findOne({ email })
    .then(async(user) => {
      // console.log(user.password)
      if (!user) return res.status(400).send("Invalid Email or Password");
      
      const validPass =await comparePassword(password, user.password);
      // console.log("check true or false",validPass)
      if (!validPass) return res.status(400).send("Invalid Password");
      user.password = undefined;
      if (validPass) return res.status(200).send(user);
      // //create and assign a token
      // const token = jwt.sign({ _id: user._id }, process.env.SECRET);
      // //return jsonwebtoken in the response header
      // return res.header("auth-token", token).send(token);
    })
    .catch((err) => {
      console.log(err);
    });
};

const userId = async (req, res) => {
  // const user = req.params.userId;
  // const userName = await User.findOne({ _id: user });
  // try {
  //   return res.json(userName);
  // } catch (e) {
  //   console.log(e);
  //   return res.status(404).send("user not found");
  // }
  res.send("Server is running")
};
module.exports = {
  signup,
  login,
  userId,
};
