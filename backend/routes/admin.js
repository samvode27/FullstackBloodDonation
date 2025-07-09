const express = require("express");
const { createAdmin, updateAdmin, deleteAdmin, loginAdmin, registerAdmin, updateDonorByAdmin, updateHospitalByAdmin, getAdminProfile, updateAdminProfile, changeAdminPassword } = require("../cotrollers/admin");
const { adminIdentifier } = require("../middlewares/adminIdentification");

const router = express.Router();

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });


//Register Admin
router.post('/adminlogin', loginAdmin)

//Login Admin
router.post('/adminregister', registerAdmin)

//add Admin
router.post('/', createAdmin)

//update Admin
router.put('/profile', adminIdentifier, updateAdminProfile);

//delete Admin
router.delete('/:id', deleteAdmin)

router.put("/donors/:id", updateDonorByAdmin);

// router.put("/hospitals/:id", updateHospitalByAdmin);

router.put("/hospitals/:id", upload.single("officialDocument"), updateHospitalByAdmin);

router.get('/profile', adminIdentifier, getAdminProfile);

router.put('/change-password', adminIdentifier, changeAdminPassword);

module.exports = router;