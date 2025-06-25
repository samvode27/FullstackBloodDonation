const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const { createAdmin, updateAdmin, deleteAdmin, loginAdmin, registerAdmin } = require("../cotrollers/admin");
const { verifyAdminToken } = require("../middlewares/verifyToken");


const router = express.Router();
const multer = require('multer');
const { updateDonorByAdmin } = require("../cotrollers/donor");

// File upload setup for image
const storage = multer.memoryStorage();
const upload = multer({ storage });

//Register Admin
router.post('/adminlogin', loginAdmin)

//Login Admin
router.post('/adminregister', registerAdmin)

//add Admin
router.post('/', createAdmin)

//update Admin
router.put('/:id', updateAdmin)

//delete Admin
router.delete('/:id', deleteAdmin)

router.put('/donors/:id', verifyAdminToken, updateDonorByAdmin);

module.exports = router;