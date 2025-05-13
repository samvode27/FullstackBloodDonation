const jwt = require("jsonwebtoken");
const { signupSchema, signinSchema, changePasswordSchema,acceptCodeSchema, acceptForgotPasswordCodeSchema } = require("../middlewares/validator");
const Hospital = require('../Models/Hospital')
const transport = require('../middlewares/sendMail');
const dotenv = require("dotenv");
dotenv.config();
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
      const existingHospital = await Hospital.findOne({email});

      if(existingHospital){
          return res.status(401).json({
            success: false,
            message: 'Hospital already exists!'                                                                                            
         })                                                                                                
      }

      const hashedPassword = await doHash(password, 12)

      const newHospital = new Hospital({
         email,
         password: hashedPassword                                                                                              
      })
      const result = await newHospital.save()
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

      const existingHospital = await Hospital.findOne({email}).select('+password');
      if(!existingHospital){
          return res.status(401).json({
            success: false,
            message: 'Hospital does not exists!'                                                                                            
         })                                                                                                
      }

      const result = await doHashValidation(password, existingHospital.password)
      if(!result){
         return res.status(401).json({
            success: false,
            message: 'Invalid Credentials'                                                                                         
         }) 
      }

      const token = jwt.sign({
         userId: existingHospital._id,
         email: existingHospital.email,
         verified: existingHospital.verified,
      }, 
         process.env.JWT_SEC,{
            expiresIn: '8hr'
         }
      );

      res.cookie('Authorization', 'Bearer' + token, { expires : new Date(Date.now() + 8 * 3600000), 
         httpOnly: process.env.NODE_ENV === 'production', 
         secure: process.env.NODE_ENV === 'production',
      }).json({
         success: true,
         token,
         message: 'Hospital logged in successfully'
      })

   } catch (error) {
      console.log(error)
   }
}

const sendVerificationCode = async (req, res) => {
   const {email} = req.body;
   try {
      const existingHospital = await Hospital.findOne({email})
      if(!existingHospital){
         return res.status(404)
                   .json({
                     success: false,
                     message: 'Hospital does not exists!'
                   })  
      }

      if(existingHospital.verified){
         return res.status(400).json({
                                 success: false,
                                 message: 'You are already verified!'
                              })  
      }

      const codeValue = Math.floor(Math.random() * 1000000).toString();

      let info = await transport.sendMail({
         from: process.env.EMAIL_USER,
         to: existingHospital.email,
         subject: "Verification code",
         html: "<h1>" + codeValue + "</h1>"
      })

      if(info.accepted[0] === existingHospital.email){
         const hashedCodeValue = hmacProcces(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
         existingHospital.verificationCode = hashedCodeValue;
         existingHospital.verificationCodeValidation = Date.now();
         await existingHospital.save()
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
      const existingHospital = await Hospital.findOne({email}).select("+verificationCode +verificationCodeValidation")

      if(!existingHospital){
         return res.status(401).json({
           success: false,
           message: 'Hospital does not exists!'                                                                                            
        })                                                                                                
      }
      if(existingHospital.verified){
         return res.status(400).json({
           success: false,
           message: 'You are already verified!'                                                                                            
        })                                                                                                
     }
     if(!existingHospital.verificationCode || !existingHospital.verificationCodeValidation){
         return res.status(400).json({
            success: false,
            message: 'something is wrong with the code!'                                                                                            
         })                                                                                                
      }
      if(Date.now() - existingHospital.verificationCodeValidation > 5 * 60 * 1000){
         return res.status(400).json({
            success: false,
            message: 'code has been expired!'                                                                                            
         })     
      }

      const hashedCodeValue = hmacProcces(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
      if(hashedCodeValue === existingHospital.verificationCode){
         existingHospital.verified = true;
         existingHospital.verificationCode = undefined;
         existingHospital.verificationCodeValidation = undefined;
         await existingHospital.save();
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

      const existingHospital = await Hospital.findOne({_id: userId}).select('+password')
      if(!existingHospital){
         return res.status(401)
                   .json({
                     success: false,
                     message: 'User does not exists!'
                   })  
      }

      const result = await doHashValidation(oldPassword, existingHospital.password);
      if(!result){
         return res.status(401).json({
            success: false,
            message: "Invalid creadentials"
         })
      }
      const hashedPassword = await doHash(newPassword, 12);
      existingHospital.password = hashedPassword;
      await existingHospital.save();
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
      const existingHospital = await Hospital.findOne({email})
      if(!existingHospital){
         return res.status(404)
                   .json({
                     success: false,
                     message: 'Hospital does not exists!'
                   })  
      }

      const codeValue = Math.floor(Math.random() * 1000000).toString();

      let info = await transport.sendMail({
         from: process.env.EMAIL_USER,
         to: existingHospital.email,
         subject: "Forgot password code",
         html: "<h1>" + codeValue + "</h1>"
      })

      if(info.accepted[0] === existingHospital.email){
         const hashedCodeValue = hmacProcces(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
         existingHospital.forgotPasswordCode = hashedCodeValue;
         existingHospital.forgotPasswordCodeValidation = Date.now();
         await existingHospital.save()
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
      const existingHospital = await Hospital.findOne({email}).select("+forgotPasswordCode +forgotPasswordCodeValidation")

      if(!existingHospital){
         return res.status(401).json({
           success: false,
           message: 'Hospital does not exists!'                                                                                            
        })                                                                                                
      }
 
     if(!existingHospital.forgotPasswordCode || !existingHospital.forgotPasswordCodeValidation){
         return res.status(400).json({
            success: false,
            message: 'something is wrong with the code!'                                                                                            
         })                                                                                                
      }
      if(Date.now() - existingHospital.forgotPasswordCodeValidation > 5 * 60 * 1000){
         return res.status(400).json({
            success: false,
            message: 'code has been expired!'                                                                                            
         })     
      }

      const hashedCodeValue = hmacProcces(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
      if(hashedCodeValue === existingHospital.forgotPasswordCode){
         const hashedPassword = await doHash(newPassword, 12);
         existingHospital.password = hashedPassword;
         existingHospital.forgotPasswordCode = undefined;
         existingHospital.forgotPasswordCodeValidation = undefined;
         await existingHospital.save();
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

//Create Hospital
const createHospital = async(req, res) => {
   try {
        let password = req.body.password;
   
        if (password) {
          password = await doHash(password, 12); // bcrypt hash instead of AES
        }
   
        const newHospital = new Hospital({
          ...req.body,
          password,
        });
   
        const hospital = await newHospital.save();
        res.status(201).json(hospital);
      } catch (error) {
        res.status(500).json({ error: error.message });
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

module.exports = { deleteHospital, getOneHospital, getAllHospitals, getHospitalStats, updateHospital, createHospital, signup, signin,
sendVerificationCode, verifyVerificationCode, changePassword, sendForgotPasswordCode, verifyForgotPasswordCode }