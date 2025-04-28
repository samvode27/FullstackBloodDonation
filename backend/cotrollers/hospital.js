const Hospital = require('../Models/Hospital')

//Create Hospital
const createHospital = async(req, res) => {
   try {
      const newHospital = Hospital(req.body);
      const hospital = await newHospital.save();
      res.status(201).json(hospital);                                                                                                 
   } catch (error) {
      res.status(500).json(error);                                                                                                                                                                                      
   }                                                                                                    
}

//getAllHospitals
const getAllHospitals = async(req, res) => {
   try {
      const hospitals = await Hospital.find().sort({createdAt: -1})
      res.status(200).json(hospitals)                                                                                                 
   } catch (error) {
      res.status(500).json(error)                                                                                                 
   }                                                                                                     
}

   
//Update Hospital
const updateHospital = async (req, res) => {
   try {
      const updateHospital = await Hospital.findByIdAndUpdate(
         req.params.id,
         { $set: req.body },
         { new: true }                                                                                              
      )    
      res.status(201).json(updateHospital)                                                                                                                                                                                              
   } catch (error) {
      res.status(500).json(error)                                                                                                                                                                                              
   }                                                                                                     
}

//getOneHospital
const getOneHospital = async(req, res) => {
   try {
       const hospital = await Hospital.findById(req.params.id);
       res.status(200).json(hospital);                                                                                                
   } catch (error) {
       res.status(500).json(error)                                                                                                 
   }                                                                                                     
}

//deleteHospital
const deleteHospital = async (req, res) => {
   try {
      await Hospital.findByIdAndDelete(req.params.id); 
      res.status(201).json("Hospital deleted Successfully");                                                                                                 
   } catch (error) {
      res.status(500).json(error)                                                                                                   
   }                                                                                                    
}

//Hospital Stats
const getHospitalStats = async (req, res) => {
   try {
      const Hospitalstats = await Hospital.aggregate([
         {
            $group: {
               _id: "$bloodgroup",
               count: { $sum: 1 }                                                                                        
            }                                                                                           
         }                                                                                              
      ]);
      
      res.status(200).json(Hospitalstats);    
   } catch (error) {
       res.status(500).json(error)                                                                                                 
   }                                                                                                    
}

module.exports = { deleteHospital, getOneHospital, getAllHospitals, getHospitalStats, updateHospital, createHospital }