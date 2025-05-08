const jwt = require('jsonwebtoken');

const identifier = (req, res, next) => {
   let token;

   // Safely access headers and cookies
   const isNonBrowser = req.headers?.client === 'not-browser';

   if (isNonBrowser) {
      token = req.headers?.authorization || '';  // Expecting: Bearer <token>
   } else {
      token = req.cookies?.Authorization || '';  // Cookies may be undefined
   }

   // Check if token exists
   if (!token) {
      return res.status(403).json({
         success: false,
         message: 'Unauthorized — token not found',
      });
   }

   try {
      // Support "Bearer <token>" format
      if (token.startsWith('Bearer ')) {
         const userToken = token.split(' ')[1];

         // Verify the JWT
         const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);

         if (jwtVerified) {
            req.user = jwtVerified;
            return next();
         } else {
            throw new Error('Invalid token');
         }
      } else {
         return res.status(400).json({
            success: false,
            message: 'Malformed token — expected Bearer format',
         });
      }
   } catch (error) {
      console.error('JWT verification error:', error.message);
      return res.status(401).json({
         success: false,
         message: 'Invalid or expired token',
      });
   }
};

module.exports = { identifier };
