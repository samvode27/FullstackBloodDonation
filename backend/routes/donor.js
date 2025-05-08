const express = require("express");
const { createDonor, getAllDonor, updateDonor, getOneDonor, deleteDonor, getDonorStats, loginDonor, registerDonor, forgotPassword, resetPassword, changePassword, signin, signup, sendVerificationCode, verifyVerificationCode, sendForgotPasswordCode, verifyForgotPasswordCode } = require("../cotrollers/donor");
const { verifyToken } = require("../middlewares/verifyToken");
const router = express.Router();
const { identifier } = require('../middlewares/identification')


router.post('/signup', signup)
router.post('/signin', signin)

router.patch('/sendverificationcode', identifier, sendVerificationCode)
router.patch('/verifyverificationcode', identifier, verifyVerificationCode)
router.patch('/change-password', identifier, changePassword)

router.patch('/send-forgot-password-code', sendForgotPasswordCode)
router.patch('/verify-forgot-password-code', verifyForgotPasswordCode)


//add donor
router.post('/', createDonor)

//get all donor
router.get('/', getAllDonor)

//update
router.put('/:id', updateDonor)

//get one donor
router.get('/find/:id', getOneDonor)

//delete donor
router.delete('/:id', deleteDonor)

//donor stats
router.get('/stats', getDonorStats)

module.exports = router;