const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const { createAdmin, updateAdmin, deleteAdmin, loginAdmin, registerAdmin } = require("../cotrollers/admin");
const router = express.Router();

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

module.exports = router;