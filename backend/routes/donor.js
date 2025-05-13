const express = require("express");
const { createDonor, getAllDonor, updateDonor, getOneDonor, deleteDonor, getDonorStats, changePassword, signin, signup, sendVerificationCode, verifyVerificationCode, sendForgotPasswordCode, verifyForgotPasswordCode } = require("../cotrollers/donor");
const router = express.Router();
const { identifier } = require('../middlewares/identification')


router.post('/signup', signup)
router.post('/signin', signin)

router.patch('/sendverificationcode', identifier, sendVerificationCode)
router.patch('/verifyverificationcode', identifier, verifyVerificationCode)
router.patch('/changepassword', identifier, changePassword)

router.patch('/sendforgotpasswordcode', sendForgotPasswordCode)
router.patch('/verifyforgotpasswordcode', verifyForgotPasswordCode)


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