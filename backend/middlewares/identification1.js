// const jwt = require('jsonwebtoken');

// const identifier = (req, res, next) => {
//   let token = '';

//   // Check Authorization header first
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
//     token = req.headers.authorization.split(' ')[1];
//   }
//   // Fallback to cookies if not in headers
//   else if (req.cookies?.Authorization && req.cookies.Authorization.startsWith('Bearer ')) {
//     token = req.cookies.Authorization.split(' ')[1];
//   }

//   if (!token) {
//     return res.status(403).json({
//       success: false,
//       message: 'Unauthorized — token not found',
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SEC);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({
//       success: false,
//       message: 'Invalid or expired token',
//     });
//   }
// };

// module.exports = { identifier };



// const jwt = require('jsonwebtoken');

// const identifier1 = (req, res, next) => {
//   const token = req.cookies?.hospitalToken;
//   if (!token) return res.status(403).json({ success: false, message: 'Hospital token missing' });

//   try {
//     req.user = jwt.verify(token, process.env.JWT_SEC);
//     next();
//   } catch {
//     return res.status(401).json({ success: false, message: 'Invalid hospital token' });
//   }
// };


// module.exports = { identifier1 };

const jwt = require('jsonwebtoken');

const identifier1 = (req, res, next) => {
  const token = req.cookies?.hospitalToken;

  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized — hospital token not found',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SEC);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired hospital token',
    });
  }
};

module.exports = { identifier1 };

