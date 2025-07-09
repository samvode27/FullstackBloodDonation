const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

const {createHospital, getAllHospitals,
  updateHospital,
  getOneHospital,
  deleteHospital,
  getHospitalStats,
  signup,
  signin,
  sendVerificationCode,
  verifyVerificationCode,
  changePassword,
  sendForgotPasswordCode,
  verifyForgotPasswordCode,
  getMyProfile,
  updateProfileInfo,
  uploadProfilePicture
} = require("../cotrollers/hospital");

const { identifier } = require("../middlewares/identification");
const { identifier1 } = require("../middlewares/identification1");
const Hospital = require("../Models/Hospital");

// === Multer setup ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Uploads directory
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const uploadDocument = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Accept PDF or images
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(new Error("Only PDF, JPG, PNG allowed"));
    }
    cb(null, true);
  }
});

const upload = multer({ storage});

// === Auth routes ===
// router.post('/signup', signup);
router.post('/signup', uploadDocument.single("document"), signup);
router.post('/signin', signin);

// === Verification routes ===
router.patch('/sendverificationcode', sendVerificationCode);
router.patch('/verifyverificationcode', verifyVerificationCode);
router.patch('/changepassword', identifier, changePassword);
router.patch('/sendforgotpasswordcode', sendForgotPasswordCode);
router.patch('/verifyforgotpasswordcode', verifyForgotPasswordCode);

// === Profile routes ===
router.get("/me", identifier1, getMyProfile);
router.put("/updateprofile/:id", identifier1, updateProfileInfo);
// router.put('updateprofile/:id', updateProfileInfo);

router.post("/uploadprofilepic", identifier1, upload.single("image"), uploadProfilePicture);

// === Hospital CRUD ===
router.post('/', createHospital);
router.get('/', getAllHospitals);
router.get('/stats', getHospitalStats);
router.get('/find/:id', getOneHospital);
// router.put('/:id', updateHospital);

router.put('/:id', uploadDocument.single("officialDocument"), updateHospital);

router.delete('/:id', deleteHospital);

// In hospitals.js route file
router.get('/count', async (req, res) => {
  try {
    const all = await Hospital.find(); // 👈 log all to debug
    const count = await Hospital.countDocuments();
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get donor count' });
  }
});


module.exports = router;
