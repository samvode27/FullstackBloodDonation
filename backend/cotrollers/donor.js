const CryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
const { signupSchema, signinSchema, changePasswordSchema,acceptCodeSchema, acceptForgotPasswordCodeSchema } = require("../middlewares/validator");
const Donor = require("../Models/Donor");
const transport = require('../middlewares/sendMail');
const dotenv = require("dotenv");
dotenv.config();
const sendEmail = require('../utils/sendMail')
const { doHash, doHashValidation, hmacProcces } = require("../utils/hasing");


const signup = async (req, res) => {
   const {email, password} = req.body;
   try {
      const {error, value} = signupSchema.validate({email, password});
      
      if(error){
         return res.status(401).json({
            success: false,
            message: error.details[0].message                                                                                            
         })                                                                                              
      }
      const existingDonor = await Donor.findOne({email});

      if(existingDonor){
          return res.status(401).json({
            success: false,
            message: 'User already exists!'                                                                                            
         })                                                                                                
      }

      const hashedPassword = await doHash(password, 12)

      const newDonor = new Donor({
         email,
         password: hashedPassword                                                                                              
      })
      const result = await newDonor.save()
      result.password = undefined
         res.status(201).json({
            success: true,
            message: 'Your account have been created successfully',
            result,                                                                                           
         })    

   } catch (error) {
       console.log(error)                                                                                                
   }                                                                                                      
};

const signin =  async (req, res) => {
   const {email, password} = req.body;
   try {
      const {error, value} = signinSchema.validate({email, password});

      if(error){
         return res.status(401).json({
            success: false,
            message: error.details[0].message                                                                                            
         })  
      }

      const existingDonor = await Donor.findOne({email}).select('+password');
      if(!existingDonor){
          return res.status(401).json({
            success: false,
            message: 'User does not exists!'                                                                                            
         })                                                                                                
      }

      const result = await doHashValidation(password, existingDonor.password)
      if(!result){
         return res.status(401).json({
            success: false,
            message: 'Invalid Credentials'                                                                                         
         }) 
      }

      const token = jwt.sign({
         userId: existingDonor._id,
         email: existingDonor.email,
         verified: existingDonor.verified,
      }, 
         process.env.TOKEN_SECRET,{
            expiresIn: '8hr'
         }
      );

      res.cookie('Authorization', 'Bearer' + token, { expires : new Date(Date.now() + 8 * 3600000), 
         httpOnly: process.env.NODE_ENV === 'production', 
         secure: process.env.NODE_ENV === 'production',
      }).json({
         success: true,
         token,
         message: 'logged in successfully'
      })

   } catch (error) {
      console.log(error)
   }
}

const sendVerificationCode = async (req, res) => {
   const {email} = req.body;
   try {
      const existingDonor = await Donor.findOne({email})
      if(!existingDonor){
         return res.status(404)
                   .json({
                     success: false,
                     message: 'User does not exists!'
                   })  
      }

      if(existingDonor.verified){
         return res.status(400).json({
                                 success: false,
                                 message: 'You are already verified!'
                              })  
      }

      const codeValue = Math.floor(Math.random() * 1000000).toString();

      let info = await transport.sendMail({
         from: process.env.EMAIL_USER,
         to: existingDonor.email,
         subject: "Verification code",
         html: "<h1>" + codeValue + "</h1>"
      })

      if(info.accepted[0] === existingDonor.email){
         const hashedCodeValue = hmacProcces(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
         existingDonor.verificationCode = hashedCodeValue;
         existingDonor.verificationCodeValidation = Date.now();
         await existingDonor.save()
         return res.status(200)
                    .json({
                        success: false,
                        message: 'Code sent!'
                    })  
      }
      res.status(500).json({
                        success: false,
                        message: 'Code sent failed!'
                    })  
       
   } catch (error) {
      console.log(error);
      res.status(500).json({
         success: false,
         message: 'An error occurred while sending the verification code.'
      });
   }
}

const verifyVerificationCode = async (req, res) => {
   const {email, providedCode} = req.body;
   try {
      const {error, value} = acceptCodeSchema.validate({email, providedCode});
      
      if(error){
         return res.status(401).json({
            success: false,
            message: error.details[0].message                                                                                            
         })                                                                                              
      }
 
      const codeValue = providedCode.toString()
      const existingDonor = await User.findOne({email}).select("+verificationCode +verificationCodeValidation")

      if(!existingDonor){
         return res.status(401).json({
           success: false,
           message: 'User does not exists!'                                                                                            
        })                                                                                                
      }
      if(existingDonor.verified){
         return res.status(400).json({
           success: false,
           message: 'You are already verified!'                                                                                            
        })                                                                                                
     }
     if(!existingDonor.verificationCode || !existingDonor.verificationCodeValidation){
         return res.status(400).json({
            success: false,
            message: 'something is wrong with the code!'                                                                                            
         })                                                                                                
      }
      if(Date.now() - existingDonor.verificationCodeValidation > 5 * 60 * 1000){
         return res.status(400).json({
            success: false,
            message: 'code has been expired!'                                                                                            
         })     
      }

      const hashedCodeValue = hmacProcces(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
      if(hashedCodeValue === existingDonor.verificationCode){
         existingDonor.verified = true;
         existingDonor.verificationCode = undefined;
         existingDonor.verificationCodeValidation = undefined;
         await existingDonor.save();
         return res.status(200).json({
            success: true,
            message: 'your account has been verified!'                                                                                            
         })   
      }
      return res.status(400).json({
         success: false,
         message: 'Unexpected occured!'                                                                                            
      })   

   } catch (error) {
      console.log(error)
   }
}

const changePassword = async (req, res) => {
   const { userId, verified } = req.user;
   const { oldPassword, newPassword } = req.body;
   try {
      const {error, value} = changePasswordSchema.validate({oldPassword, newPassword});
      
      if(error){
         return res.status(401).json({
            success: false,
            message: error.details[0].message                                                                                        
         })                                                                                              
      }
      if(!verified){
         return res.status(401).json({
            success: false,
            message: 'You are not verified user'                                                                                           
         })                                                                                              
      }

      const existingDonor = await Donor.findOne({_id: userId}).select('+password')
      if(!existingDonor){
         return res.status(401)
                   .json({
                     success: false,
                     message: 'User does not exists!'
                   })  
      }

      const result = await doHashValidation(oldPassword, existingDonor.password);
      if(!result){
         return res.status(401).json({
            success: false,
            message: "Invalid creadentials"
         })
      }
      const hashedPassword = await doHash(newPassword, 12);
      existingDonor.password = hashedPassword;
      await existingDonor.save();
      return res.status(200).json({
         success: true,
         message: "Password updated"
      })

   } catch (error) {
      console.log(error)
   }
}

const sendForgotPasswordCode = async (req, res) => {
   const {email} = req.body;
   try {
      const existingDonor = await User.findOne({email})
      if(!existingDonor){
         return res.status(404)
                   .json({
                     success: false,
                     message: 'User does not exists!'
                   })  
      }

      const codeValue = Math.floor(Math.random() * 1000000).toString();

      let info = await transport.sendMail({
         from: process.env.EMAIL_USER,
         to: existingDonor.email,
         subject: "Forgot password code",
         html: "<h1>" + codeValue + "</h1>"
      })

      if(info.accepted[0] === existingDonor.email){
         const hashedCodeValue = hmacProcces(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
         existingDonor.forgotPasswordCode = hashedCodeValue;
         existingDonor.forgotPasswordCodeValidation = Date.now();
         await existingDonor.save()
         return res.status(200)
                    .json({
                        success: false,
                        message: 'Code sent!'
                    })  
      }
      res.status(500).json({
                        success: false,
                        message: 'Code sent failed!'
                    })  
       
   } catch (error) {
      console.log(error);
      res.status(500).json({
         success: false,
         message: 'An error occurred while sending the verification code.'
      });
   }
}

const verifyForgotPasswordCode = async (req, res) => {
   const {email, providedCode, newPassword} = req.body;
   try {
      const {error, value} = acceptForgotPasswordCodeSchema.validate({email, providedCode, newPassword});
      
      if(error){
         return res.status(401).json({
            success: false,
            message: error.details[0].message                                                                                            
         })                                                                                              
      }
 
      const codeValue = providedCode.toString()
      const existingDonor = await User.findOne({email}).select("+forgotPasswordCode +forgotPasswordCodeValidation")

      if(!existingDonor){
         return res.status(401).json({
           success: false,
           message: 'User does not exists!'                                                                                            
        })                                                                                                
      }
 
     if(!existingDonor.forgotPasswordCode || !existingDonor.forgotPasswordCodeValidation){
         return res.status(400).json({
            success: false,
            message: 'something is wrong with the code!'                                                                                            
         })                                                                                                
      }
      if(Date.now() - existingDonor.forgotPasswordCodeValidation > 5 * 60 * 1000){
         return res.status(400).json({
            success: false,
            message: 'code has been expired!'                                                                                            
         })     
      }

      const hashedCodeValue = hmacProcces(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
      if(hashedCodeValue === existingDonor.forgotPasswordCode){
         const hashedPassword = await doHash(newPassword, 12);
         existingDonor.password = hashedPassword;
         existingDonor.forgotPasswordCode = undefined;
         existingDonor.forgotPasswordCodeValidation = undefined;
         await existingDonor.save();
         return res.status(200).json({
            success: true,
            message: 'Password updated!!'                                                                                            
         })   
      }
      return res.status(400).json({
         success: false,
         message: 'Unexpected occured!'                                                                                            
      })   

   } catch (error) {
      console.log(error)
   }
}

//Create Donor
const createDonor = async (req, res) => {
   try {
     let password = req.body.password;
 
     if (password && process.env.PASS) {
       password = CryptoJs.AES.encrypt(password, process.env.PASS).toString();
     }
 
     const newDonor = new Donor({
       ...req.body,
       password,
     });
 
     const donor = await newDonor.save();
     res.status(201).json(donor);
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
 };
 
//getAllDonor
const getAllDonor = async (req, res) => {
   try {
      const donors = await Donor.find().sort({ createdAt: -1 })
      res.status(200).json(donors)
   } catch (error) {
      res.status(500).json(error)
   }
}


//Update Donor
const updateDonor = async (req, res) => {
   try {
      const updateDonor = await Donor.findByIdAndUpdate(
         req.params.id,
         { $set: req.body },
         { new: true }
      )
      res.status(201).json(updateDonor)
   } catch (error) {
      res.status(500).json(error)
   }
}

//getOneDonor
const getOneDonor = async (req, res) => {
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
      res.status(201).json("Donor deleted Successfully");
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

module.exports = { deleteDonor, getOneDonor, getAllDonor, getDonorStats, updateDonor, createDonor, signin, signup,
    sendVerificationCode, verifyVerificationCode, changePassword, sendForgotPasswordCode, verifyForgotPasswordCode}