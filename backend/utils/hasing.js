const { createHmac } = require('crypto');
const { hash, compare } = require('bcryptjs');

const doHash = async (value, saltValue) => {
   try {
      const result = await hash(value, saltValue);
      return result;
   } catch (error) {
      console.error('Error hashing password:', error);
      return null;
   }
};

const doHashValidation = async (value, hashedValue) => {
   try {
      const result = await compare(value, hashedValue);
      return result;
   } catch (error) {
      console.error('Error comparing password:', error);
      return false;
   }
};

const hmacProcces = (value, key) => {
   return createHmac('sha256', key).update(value).digest('hex');
};

module.exports = { doHash, doHashValidation, hmacProcces };
