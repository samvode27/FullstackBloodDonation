const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const { createHospital, getAllHospitals, updateHospital, getOneHospital, deleteHospital, getHospitalStats, loginHospital, registerHospital } = require("../cotrollers/hospital");
const router = express.Router();

//Register Hospital
router.post('/hospitallogin', loginHospital)

//Login Hospital
router.post('/hospitalregister', registerHospital)

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