const express = require("express");
const { createProspect, getAllProspects, updateProspect, getOneProspect, deleteProspect } = require("../cotrollers/prospects");
const router = express.Router();

//create prospect
router.post('/login', createProspect)

//get all prospect
router.get('/login', getAllProspects)

//update prospect
router.put('/:id', updateProspect)

//get one prospect
router.get('/:id', getOneProspect)

//delete prospect
router.delete('/:id', deleteProspect)


module.exports = router;