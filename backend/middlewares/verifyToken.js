const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  console.log("AUTH HEADER:", req.headers.authorization);

  if (authHeader) {
    const token = authHeader.split("")[1];
    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) res.status(403).json("Token is not valid");
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You are not authenticated.");
  }
};


module.exports = {verifyToken}
