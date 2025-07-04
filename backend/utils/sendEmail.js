const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html, text }) => {
   const msg = {
      to,
      from: process.env.EMAIL_USER,
      subject,
      html,
      text,
   };

   const response = await sgMail.send(msg);
   return response;
};

module.exports = sendEmail;
