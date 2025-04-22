const express = require("express");
const { createProspect, getAllProspects, updateProspect, getOneProspect, deleteProspect } = require("../cotrollers/prospects");
const router = express.Router();

//add prospect
router.post('/login', createProspect)

//get all prospect
router.get('/', getAllProspects)

//update prospect
router.put('/:id', updateProspect)

//get one prospect
router.get('/find/:id', getOneProspect)

//delete prospect
router.delete('/:id', deleteProspect)


module.exports = router;