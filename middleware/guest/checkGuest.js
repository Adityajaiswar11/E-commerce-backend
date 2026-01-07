
const { v4: uuidv4 } = require("uuid");

const guestMiddleware =(req, res, next)=> {
  let guestId = req.cookies.guest_id;

  if (!guestId) {
    guestId = uuidv4();
    res.cookie("guest_id", guestId, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
    });
  }
  req.guestId = guestId;
  next();
};

module.exports= guestMiddleware
