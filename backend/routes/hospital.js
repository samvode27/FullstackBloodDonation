const express = require("express");
const { verifyToken } = require("../middlewares/verifyToken");
const { createHospital, getAllHospitals, updateHospital, getOneHospital, deleteHospital, getHospitalStats } = require("../cotrollers/hospital");
const router = express.Router();

//add Hospital
router.post('/', verifyToken, createHospital)

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