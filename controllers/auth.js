const { hashPassword } = require("../helper/auth");
const { comparePassword } = require("../helper/auth");
const User = require("../models/user");

// signup api
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  // Validate name, email, and password
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    // Check if the email already exists
    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
      return res.status(400).json({ message: "Email is already registered!" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create and save the new user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    return res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ message: "Internal server error. Please try again!" });
  }
};


//login api
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

const allUserList = async (req, res) => {
   try {
     const {email,name } =req.query;
     let filter = {};
     if(email) filter.email = new RegExp(email, 'i');
     if(name) filter.name = new RegExp(name, 'i');
     const users = await User.find(filter)
     if(!users.length) return res.status(404).json({ message: "No users found" });
     return res.status(200).json(users)
   } catch (error) {
     console.log(error)
     return res.status(500).json({ message: "Internal Server Error" });
   }
};

module.exports = {
  signup,
  login,
  allUserList,
};
