const Donor = require('../Models/Donor')

//Create Donor
const createDonor = async(req, res) => {
   try {
      const newDonor = Donor(req.body);
      const donor = newDonor.save();
      res.status(201).json(donor);                                                                                                 
   } catch (error) {
      res.status(500).json(error);                                                                                                                                                                                      
   }                                                                                                    
}

//getAllDonor
const getAllDonor = async(req, res) => {
   try {
      const donors = await Donor.find().sort({createdAt: -1})
      res.status(200).json(donors)                                                                                                 
   } catch (error) {
      console.error(error);
      res.status(500).json(error)                                                                                                 
   }                                                                                                     
}

   
//Update Donor
const updateDonor = async (req, res) => {
   try {
      const updateDonor = await Donor.findByIdAndUpdate(
         req.param.id,
         { $set: req.body },
         { new: true }                                                                                              
      )    
      res.status(201).json(donors)                                                                                                                                                                                              
   } catch (error) {
      res.status(500).json(error)                                                                                                                                                                                              
   }                                                                                                     
}

//getOneDonor
const getOneDonor = async(req, res) => {
   try {
       const donor = await Donor.findById(req.params.id);
       res.status(200).json(donor);                                                                                                
   } catch (error) {
       res.status(500).json(error)                                                                                                 
   }                                                                                                     
}

//deleteDonor
const deleteDonor = async (req, res) => {
   try {
      await Donor.findByIdAndDelete(req.params.id); 
      res.status(200).json("Donor deleted Successfully");                                                                                                 
   } catch (error) {
      res.status(500).json(error)                                                                                                   
   }                                                                                                    
}

//Stats
const getDonorStats = async (req, res) => {
   try {
      const stats = await Donor.aggregate([
         {
            $group: {
               _id: "$bloodgroup",
               count: { $sum: 1 }                                                                                        
            }                                                                                           
         }                                                                                              
      ]);
      
      res.status(200).json(stats);    
   } catch (error) {
       res.status(500).json(error)                                                                                                 
   }                                                                                                    
}

module.exports = { deleteDonor, getOneDonor, getAllDonor, getDonorStats, updateDonor, createDonor }