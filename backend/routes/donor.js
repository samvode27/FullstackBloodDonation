const express = require("express");
const { createDonor, getAllDonor, updateDonor, getOneDonor, deleteDonor, getDonorStats } = require("../cotrollers/donor");
const { verifyToken } = require("../middlewares/verifyToken");
const router = express.Router();

//add donor
router.post('/', verifyToken, createDonor)

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