// const jwt = require('jsonwebtoken');

// const identifier = (req, res, next) => {
//   const token = req.cookies?.donorToken;
//   if (!token) return res.status(403).json({ success: false, message: 'Donor token missing' });

//   try {
//     req.user = jwt.verify(token, process.env.JWT_SEC);
//     next();
//   } catch {
//     return res.status(401).json({ success: false, message: 'Invalid donor token' });
//   }
// };


// module.exports = { identifier };


const jwt = require('jsonwebtoken');

const identifier = (req, res, next) => {
  const token = req.cookies?.donorToken;
  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized — donor token not found',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SEC);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired donor token',
    });
  }
};

module.exports = { identifier };





// const jwt = require('jsonwebtoken');

// const identifier = (req, res, next) => {
//   let token = '';

//   // Check Authorization header first
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
//     token = req.headers.authorization.split(' ')[1];
//   }
//   // Fallback to cookies if not in headers
//   else if (req.cookies?.token) {
//     token = req.cookies.token;
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
