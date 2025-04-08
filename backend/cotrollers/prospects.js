const Prospect = require('../Models/Prospect')

//Create Prospect
const createProspect = async(req, res) => {
   try {
      const newDonor = Prospect(req.body);
      const prospect = newDonor.save();
      res.status(201).json(prospect);                                                                                                 
   } catch (error) {
      res.status(500).json(error);                                                                                                                                                                                      
   }                                                                                                    
}

//getAllProspect
const getAllProspects = async(req, res) => {
   try {
      const prospects = await Prospect.find().sort({createdAt: -1})
      res.status(200).json(prospects)                                                                                                 
   } catch (error) {
      res.status(500).json(error)                                                                                                 
   }                                                                                                     
}

//Update Prospect
const updateProspect = async (req, res) => {
   try {
      const updateProspect = await Prospect.findByIdAndUpdate(
         req.param.id,
         { $set: req.body },
         { new: true }                                                                                              
      )    
      res.status(201).json(updateProspect)                                                                                                                                                                                              
   } catch (error) {
      res.status(500).json(error)                                                                                                                                                                                              
   }                                                                                                     
}

//getOneProspect
const getOneProspect = async(req, res) => {
   try {
       const prospect = await Prospect.findById(req.params.id);
       res.status(200).json(prospect);                                                                                                
   } catch (error) {
       res.status(500).json(error)                                                                                                 
   }                                                                                                     
}

//deleteProspect
const deleteProspect = async (req, res) => {
   try {
      await Prospect.findByIdAndDelete(req.params.id); 
      res.status(200).json("Donor deleted Successfully");                                                                                                 
   } catch (error) {
      res.status(500).json(error)                                                                                                   
   }                                                                                                    
}


module.exports = { deleteProspect, getOneProspect, getAllProspects, updateProspect, createProspect }