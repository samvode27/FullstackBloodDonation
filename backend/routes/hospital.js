const express = require("express");
const { createHospital, getAllHospitals, updateHospital, getOneHospital, deleteHospital, getHospitalStats, signup, signin, sendVerificationCode, verifyVerificationCode, changePassword, sendForgotPasswordCode, verifyForgotPasswordCode } = require("../cotrollers/hospital");
const router = express.Router();
const { identifier } = require('../middlewares/identification');


router.post('/signup', signup)
router.post('/signin', signin)

router.patch('/sendverificationcode', identifier, sendVerificationCode)
router.patch('/verifyverificationcode', identifier, verifyVerificationCode)
router.patch('/changepassword', identifier, changePassword)

router.patch('/sendforgotpasswordcode', sendForgotPasswordCode)
router.patch('/verifyforgotpasswordcode', verifyForgotPasswordCode)


//add Hospital
router.post('/', createHospital)

//get all Hospitals
router.get('/', getAllHospitals)

//update hospitals
router.put('/:id', updateHospital)

//get One Hospital
router.get('/find/:id', getOneHospital)

//delete Hospital
router.delete('/:id', deleteHospital)

//donor Hospital Stats
router.get('/stats', getHospitalStats)

module.exports = router;