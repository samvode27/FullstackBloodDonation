const CryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
const Hospital = require('../Models/Hospital')
const dotenv = require("dotenv");
dotenv.config();

// Register Hospital
const registerHospital = async (req, res) => {
   try {
     const encryptedPassword = CryptoJs.AES.encrypt(
       req.body.password,
       process.env.PASS
     ).toString();
 
     const newHospital = new Hospital({
       name: req.body.name,
       email: req.body.email,
       password: encryptedPassword,
     });
 
     const savedHospital = await newHospital.save();
     res.status(201).json(savedHospital);
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
 };
 

// Login Hospital
const loginHospital = async (req, res) => {
  try {
    const user = await Hospital.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: "Hospital not registered" });
    }

    if (!user.password || !process.env.PASS) {
      return res.status(500).json({ error: "Missing password or encryption key" });
    }

    const decrypted = CryptoJs.AES.decrypt(user.password, process.env.PASS);
    const originalPassword = decrypted.toString(CryptoJs.enc.Utf8);

    if (originalPassword !== req.body.password) {
      return res.status(401).json({ error: "Wrong password" });
    }

    const { password, ...info } = user._doc;

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SEC,
      { expiresIn: "10d" }
    );

    res.status(200).json({ ...info, accessToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

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

module.exports = { deleteHospital, getOneHospital, getAllHospitals, getHospitalStats, updateHospital, createHospital, loginHospital, registerHospital }