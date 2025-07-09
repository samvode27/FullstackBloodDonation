const jwt = require("jsonwebtoken");

const adminIdentifier = (req, res, next) => {
  const token = req.cookies?.adminToken;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized — admin token missing',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SEC);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired admin token',
    });
  }
};

module.exports = { adminIdentifier };
