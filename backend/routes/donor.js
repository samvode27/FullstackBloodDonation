const express = require("express");
const { createDonor, getAllDonor, updateDonor, getOneDonor, deleteDonor, getDonorStats } = require("../cotrollers/donor");
const { verifyTokenAndAuthorization } = require("../middlewares/verifyToken");
const router = express.Router();

//add donor
router.post('/login',verifyTokenAndAuthorization, createDonor)

//get all donor
router.get('/login', getAllDonor)

//update
router.put('/:id', updateDonor)

//get one donor
router.get('/:id', getOneDonor)

//delete donor
router.delete('/:id', deleteDonor)

//donor stats
router.get('/stats', getDonorStats)

module.exports = router;