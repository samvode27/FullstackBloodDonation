const express = require("express");
const { createDonor, getAllDonor, updateDonor, getOneDonor, deleteDonor, getDonorStats, changePassword, signin, signup, sendVerificationCode, verifyVerificationCode, sendForgotPasswordCode, verifyForgotPasswordCode, getBloodStats, getBloodGroupStats, getTopDonors, recordDonation, getMyProfile, updateProfile, getDonationHistory, donateBlood, getDonationsPerYear } = require("../cotrollers/donor");
const router = express.Router();
const { identifier } = require('../middlewares/identification')
const Donor = require("../Models/Donor");


const multer = require('multer');
const path = require('path');

// Set up storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile_pics');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


// === Auth routes ===
router.post('/signup', signup)
router.post('/signin', signin)


// === Verification routes ===
router.post('/sendverificationcode', sendVerificationCode)
router.patch('/verifyverificationcode', verifyVerificationCode)
router.patch('/changepassword', identifier, changePassword)
router.patch('/sendforgotpasswordcode', sendForgotPasswordCode)
router.patch('/verifyforgotpasswordcode', verifyForgotPasswordCode)


// === Profile routes ===
router.get("/me", identifier, getMyProfile);
router.post('/uploadprofile', identifier, upload.single("image"), async (req, res) => {
  try {
    const donor = await Donor.findById(req.user.userId);
    if (!donor) return res.status(404).json({ success: false, message: "Donor not found" });

    // ✅ Save the correct relative path
    donor.profileImage = `/uploads/profile_pics/${req.file.filename}`;
    await donor.save();

    res.status(200).json({ success: true, message: "Profile picture uploaded", profileImage: donor.profileImage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error uploading profile" });
  }
});
router.put("/:id", identifier, updateProfile);

// === Hospital CRUD ===
router.post('/', createDonor)
router.get('/', getAllDonor)
router.put('/:id', updateDonor)
router.get('/find/:id', getOneDonor)
router.delete('/:id', deleteDonor)
router.get("/stats", getBloodGroupStats);


router.post("/donation", donateBlood);
router.get("/donations", identifier, getDonationHistory);
router.get("/top", getTopDonors);

// In donors.js route file
router.get('/count', async (req, res) => {
  try {
    const all = await Donor.find(); // 👈 log all to debug
    const count = await Donor.countDocuments();
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get donor count' });
  }
});

router.get('/donations/yearly', getDonationsPerYear);

module.exports = router;