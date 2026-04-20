const jwt = require("jsonwebtoken");

exports.isAuthenticated = (req, res, next) => {
  try {
    // 1. Get the token from the Header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Strip surrounding quotes (happens when frontend stores token as JSON.stringify(token) in localStorage)
    const token = authHeader.split(" ")[1].replace(/^"|"$/g, "");

    // 2. Verify the Token
    const decoded = jwt.verify(token, process.env.SECRET);
    
    // 3. Attach the decoded payload (user info) to the request object
    req.user = decoded;
    
    // 4. Continue to the next middleware or controller
    next();
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};
