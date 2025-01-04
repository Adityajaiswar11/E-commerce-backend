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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    // Verify the password
    const validPass = await comparePassword(password, user.password);
    if (!validPass) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    // Remove password from the user object before sending
    const { password: _, ...userWithoutPassword } = user.toObject();

    // Return the user details
    return res.status(200).json(userWithoutPassword);

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  signup,
  login,
};
