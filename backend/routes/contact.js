// routes/contact.js
const express = require("express");
const router = express.Router();
const { transport } = require("../middlewares/sendMail");

router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #d32f2f;">New Contact Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p style="background:#f9f9f9; padding:10px; border-left:3px solid #d32f2f;">${message}</p>
    </div>
  `;

  try {
    await transport.sendMail({
      from: `"BloodBridge Contact Form" <${email}>`,
      to: "setarigesamuel@gmail.com",
      subject: `[${subject}] Message from ${name}`,
      html: htmlContent,
    });

    res.status(200).json({ message: "Your message has been sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
});

module.exports = router;
