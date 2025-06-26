const express = require("express");
const router = express.Router();
const Subscriber = require("../Models/Subscriber");
const { transport } = require("../middlewares/sendMail");

// POST /api/newsletter/subscribe
router.post("/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const exists = await Subscriber.findOne({ email });
    if (exists) return res.status(409).json({ message: "You are already subscribed." });

    const newSub = await Subscriber.create({ email });

    // Send confirmation email
    await transport.sendMail({
      from: `"EthioLife Blood Bank" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank You for Subscribing ❤️",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #d00000;">Welcome to EthioLife Blood Bank!</h2>
          <p>Thank you for subscribing to our newsletter.</p>
          <p>We’ll keep you updated on donation campaigns, emergencies, and success stories.</p>
          <p>Stay healthy, and thank you for being a hero!</p>
          <br/>
          <p style="font-style: italic;">- EthioLife Team</p>
        </div>
      `,
    });

    return res.status(200).json({ message: "Subscribed successfully! Check your email." });
  } catch (err) {
    console.error("Subscribe Error:", err);
    return res.status(500).json({ error: "Server error. Try again later." });
  }
});

// GET /api/newsletter/count
router.get("/count", async (req, res) => {
  try {
    const count = await Subscriber.countDocuments();
    return res.status(200).json({ count });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// Get all subscribers
router.get('/', async (req, res) => {
  try {
    const subs = await Subscriber.find().sort({ createdAt: -1 });
    res.status(200).json(subs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
});

module.exports = router;
