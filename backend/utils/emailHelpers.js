const { transport } = require('../middlewares/sendMail');
const { hmacProcces } = require('../utils/hasing');

const sendverificationemail = async (donor) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const mailOptions = {
    from: `"BloodBridge" <${process.env.EMAIL_USER}>`,
    to: donor.email,
    subject: "Verify your BloodBridge account",
    html: `
      <div style="text-align:center; font-family:sans-serif;">
        <h2>Email Verification</h2>
        <p>Your code is:</p>
        <h1>${code}</h1>
        <p>This code will expire in 5 minutes. Do not share it.</p>
      </div>
    `
  };

  const result = await transport.sendMail(mailOptions);

  if (result.accepted.includes(donor.email)) {
    donor.verificationCode = hmacProcces(code, process.env.HMAC_VERIFICATION_CODE_SECRET);
    donor.verificationCodeValidation = Date.now();
    await donor.save();
    return true;
  }

  return false;
};

const sendforgotpasswordcode = async (donor) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const mailOptions = {
    from: `"BloodBridge" <${process.env.EMAIL_USER}>`,
    to: donor.email,
    subject: "Reset your BloodBridge password",
    html: `
      <div style="text-align:center; font-family:sans-serif;">
        <h2>Forgot Password</h2>
        <p>Your reset code is:</p>
        <h1>${code}</h1>
        <p>This code will expire in 5 minutes.</p>
      </div>
    `
  };

  const result = await transport.sendMail(mailOptions);

  if (result.accepted.includes(donor.email)) {
    donor.forgotPasswordCode = hmacProcces(code, process.env.HMAC_VERIFICATION_CODE_SECRET);
    donor.forgotPasswordCodeValidation = Date.now();
    await donor.save();
    return true;
  }

  return false;
};

module.exports = {
  sendverificationemail,
  sendforgotpasswordcode
};
