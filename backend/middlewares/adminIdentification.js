const jwt = require("jsonwebtoken");

const adminIdentifier = (req, res, next) => {
  try {
    const token = req.cookies.Authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SEC);
    if (!decoded.isAdmin) return res.status(403).json({ message: "Forbidden" });

    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = { adminIdentifier };
