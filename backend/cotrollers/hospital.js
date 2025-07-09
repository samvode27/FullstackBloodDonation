const jwt = require("jsonwebtoken");
const { signupSchema, signinSchema, changePasswordSchema, acceptCodeSchema, acceptForgotPasswordCodeSchema } = require("../middlewares/validator");
const Hospital = require('../Models/Hospital')
const { transport } = require('../middlewares/sendMail');
const dotenv = require("dotenv");
dotenv.config();
const { doHash, doHashValidation, hmacProcces } = require("../utils/hasing");

const signup = async (req, res) => {
   const { name, email, password, address, tel, licenseNumber } = req.body;

   try {
      const { error } = signupSchema.validate({ email, password });
      if (error) {
         return res.status(401).json({ success: false, message: error.details[0].message });
      }

      if (!licenseNumber) {
         return res.status(400).json({ success: false, message: "License number is required" });
      }

      const licenseRegex = /^[A-Z0-9\-]{5,20}$/;
      if (!licenseRegex.test(licenseNumber)) {
         return res.status(400).json({ success: false, message: "License number format invalid" });
      }

      const existingHospital = await Hospital.findOne({ email });
      if (existingHospital) {
         return res.status(401).json({ success: false, message: 'Hospital already exists!' });
      }

      const existingLicense = await Hospital.findOne({ licenseNumber });
      if (existingLicense) {
         return res.status(400).json({ success: false, message: 'License number already in use.' });
      }

      if (!req.file) {
         return res.status(400).json({
            success: false,
            message: "Official document upload is required"
         });
      }

      const hashedPassword = await doHash(password, 12);

      const newHospital = new Hospital({
         name,
         email,
         password: hashedPassword,
         address,
         tel,
         licenseNumber,
         officialDocument: req.file?.filename,
         licenseVerified: false,
      });

      await newHospital.save();

      await transport.sendMail({
         to: newHospital.email,
         from: process.env.EMAIL_USER,
         subject: "🎉 Welcome to BloodBridge!",
         html: `
            <div style="font-family: Arial, sans-serif; background-color: #f5f6fa; padding: 30px;">
               <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                  <div style="background-color: #e63946; padding: 20px; color: white; text-align: center;">
                     <h1 style="margin: 0;">Welcome to BloodBridge!</h1>
                  </div>
                  <div style="padding: 30px; text-align: left; color: #333;">
                     <p style="font-size: 18px;">Hi <strong>${newHospital.name}</strong>,</p>
                     <p style="font-size: 16px; line-height: 1.6;">
                        Thank you for registering with <strong>BloodBridge</strong>.
                     </p>
                     <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:5173/hospitalverifycode" style="background-color: #1d3557; color: #fff; text-decoration: none; padding: 15px 25px; font-size: 16px; border-radius: 5px;">
                           ✅ Verify Your Email
                        </a>
                     </div>
                     <p style="font-size: 15px; color: #555;">
                        The link will take you to our secure verification page where you’ll enter your code. Check your inbox for it!
                     </p>
                     <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                     <p style="font-size: 14px; color: #999; text-align: center;">
                        Stay safe. Stay strong.
                        — The BloodBridge Team
                     </p>
                  </div>
               </div>
            </div>
         `
      });

      res.status(201).json({
         success: true,
         message: 'Hospital registered. Now verify your email.'
      });

   } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: 'Server error' });
   }
};

const signin = async (req, res) => {
   const { email, password } = req.body;

   try {
      const { error } = signinSchema.validate({ email, password });
      if (error) {
         return res.status(401).json({ success: false, message: error.details[0].message });
      }

      const existingHospital = await Hospital.findOne({ email }).select('+password');
      if (!existingHospital) {
         return res.status(401).json({ success: false, message: 'Hospital does not exists!' });
      }

      const result = await doHashValidation(password, existingHospital.password);
      if (!result) {
         return res.status(401).json({ success: false, message: 'Invalid Credentials' });
      }

      const token = jwt.sign(
         {
            userId: existingHospital._id,
            email: existingHospital.email,
            verified: existingHospital.verified,
         },
         process.env.JWT_SEC,
         { expiresIn: '8h' }
      );

      res.clearCookie('donorToken');

      res.cookie('hospitalToken', token, {
         secure: process.env.NODE_ENV === 'production',
         expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
         httpOnly: true,
         sameSite: 'Lax'
      });

      res.status(200).json({
         success: true,
         token,
         message: existingHospital.verified
            ? 'Hospital logged in successfully'
            : 'Hospital logged in but not verified',
         user: {
            id: existingHospital._id,
            email: existingHospital.email,
            name: existingHospital.name,
            password: existingHospital.password,
            tel: existingHospital.tel,
            address: existingHospital.address,
            verified: existingHospital.verified
         }
      });

   } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Server error" });
   }
};

const sendVerificationCode = async (req, res) => {
   const { email } = req.body;

   if (!email) {
      return res.status(400).json({ message: "Email is required" });
   }

   try {
      const existingHospital = await Hospital.findOne({ email });
      if (!existingHospital) {
         return res.status(404).json({ success: false, message: 'Hospital does not exists!' });
      }

      if (existingHospital.verified) {
         return res.status(400).json({ success: false, message: 'You are already verified!' });
      }

      const codeValue = Math.floor(Math.random() * 1000000).toString();
      const hashedCodeValue = hmacProcces(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);

      const msg = {
         to: existingHospital.email,
         from: process.env.EMAIL_USER,
         subject: '🔐 Email Verification Code',
         html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 30px; border-radius: 10px;">
               <h2 style="color: #d32f2f; text-align: center;">Blood Donation Platform</h2>
               <p style="font-size: 18px; color: #333;">Hello <strong>${existingHospital.name}</strong>,</p>
               <p style="font-size: 16px;">Thank you for registering with us! To complete your registration, please use the following verification code:</p>
               <div style="background: #f8f8f8; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <p style="font-size: 32px; font-weight: bold; color: #333;">${codeValue}</p>
               </div>
               <p>This code will expire in <strong>5 minutes</strong>. Do not share it with anyone.</p>
               <p style="color: #999;">If you did not request this, you can ignore this email.</p>
               <p style="margin-top: 30px;">Sincerely,<br><strong>Ethiopian National Blood Bank</strong></p>
            </div>
         `
      };

      await transport.sendMail(msg);
      existingHospital.verificationCode = hashedCodeValue;
      existingHospital.verificationCodeValidation = Date.now();
      await existingHospital.save();

      return res.status(200).json({ success: true, message: 'Code sent!' });

   } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: 'An error occurred while sending the verification code.' });
   }
};

const verifyVerificationCode = async (req, res) => {
   const { email, providedCode } = req.body;

   try {
      const { error } = acceptCodeSchema.validate({ email, providedCode });
      if (error) {
         return res.status(401).json({ success: false, message: error.details[0].message });
      }

      const existingHospital = await Hospital.findOne({ email }).select("+verificationCode +verificationCodeValidation");
      if (!existingHospital) {
         return res.status(401).json({ success: false, message: 'Hospital does not exists!' });
      }

      if (existingHospital.verified) {
         return res.status(400).json({ success: false, message: 'You are already verified!' });
      }

      if (!existingHospital.verificationCode || !existingHospital.verificationCodeValidation) {
         return res.status(400).json({ success: false, message: 'Something is wrong with the code!' });
      }

      const isExpired = Date.now() - existingHospital.verificationCodeValidation > 5 * 60 * 1000;
      if (isExpired) {
         return res.status(400).json({ success: false, message: 'Code has expired!' });
      }

      const hashedCodeValue = hmacProcces(providedCode, process.env.HMAC_VERIFICATION_CODE_SECRET);
      if (hashedCodeValue !== existingHospital.verificationCode) {
         return res.status(400).json({ success: false, message: 'Invalid verification code!' });
      }

      existingHospital.verified = true;
      existingHospital.verificationCode = undefined;
      existingHospital.verificationCodeValidation = undefined;
      await existingHospital.save();

      return res.status(200).json({ success: true, message: 'Your account has been verified!' });

   } catch (error) {
      console.error("Verification error:", error);
      return res.status(500).json({ success: false, message: 'Internal server error' });
   }
};

const changePassword = async (req, res) => {
   const { userId, verified } = req.user;
   const { oldPassword, newPassword } = req.body;
   try {
      const { error, value } = changePasswordSchema.validate({ oldPassword, newPassword });

      if (error) {
         return res.status(401).json({ success: false, message: error.details[0].message })
      }

      if (!verified) {
         return res.status(401).json({ success: false, message: 'You are not verified user' })
      }

      const existingHospital = await Hospital.findOne({ _id: userId }).select('+password')
      if (!existingHospital) {
         return res.status(401).json({ success: false, message: 'User does not exists!' })
      }

      const isPasswordValid = await doHashValidation(oldPassword, existingHospital.password);
      if (!isPasswordValid) {
         return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      existingHospital.password = await doHash(newPassword, 12);
      await existingHospital.save();

      // Send password change notification email via MailerSend SMTP
      try {
         await transport.sendMail({
            to: existingHospital.email,
            from: process.env.EMAIL_USER,
            subject: "Your password has been changed",
            html: `<p>Hello ${existingHospital.name || ''},</p>
                   <p>Your password was recently changed. If you did not perform this action, please contact our support team immediately.</p>`
         });
      } catch (mailErr) {
         console.error("Failed to send password change email:", mailErr.message);
      }

      return res.status(200).json({ success: true, message: "Password updated successfully" });
   } catch (error) {
      console.log(error)
   }
}

const sendForgotPasswordCode = async (req, res) => {
   const { email } = req.body;
   try {
      const existingHospital = await Hospital.findOne({ email })
      if (!existingHospital) {
         return res.status(404).json({ success: false, message: 'Hospital does not exists!' })
      }

      const codeValue = Math.floor(Math.random() * 1000000).toString();

      const msg = {
         to: existingHospital.email,
         from: process.env.EMAIL_USER,
         subject: '🔒 Reset Your Password',
         html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 30px; border-radius: 10px;">
               <h2 style="color: #d32f2f; text-align: center;">Password Reset Request</h2>
               <p style="font-size: 18px; color: #333;">Dear <strong>${existingHospital.name}</strong>,</p>
               <p style="font-size: 16px;">You requested to reset your password. Use the code below to continue:</p>
               <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
               <p style="font-size: 32px; font-weight: bold; color: #333;">${codeValue}</p>
               </div>
               <p>This code is valid for <strong>5 minutes</strong>. Keep it confidential and don’t share it with anyone.</p>
               <p>If you did not request a password reset, you can ignore this message. Your account is safe.</p>
               <p style="margin-top: 30px;">Best regards,<br><strong>Ethiopian National Blood Bank</strong></p>
            </div>
         `
      };

      await transport.sendMail(msg);

      const hashedCodeValue = hmacProcces(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
      existingHospital.forgotPasswordCode = hashedCodeValue;
      existingHospital.forgotPasswordCodeValidation = Date.now();
      await existingHospital.save()

      return res.status(200).json({ success: false, message: 'Code sent!' })

   } catch (error) {
      console.log(error);
      res.status(500).json({
         success: false,
         message: 'An error occurred while sending the verification code.'
      });
   }
}

const verifyForgotPasswordCode = async (req, res) => {
   const { email, providedCode, newPassword } = req.body;
   try {
      const { error, value } = acceptForgotPasswordCodeSchema.validate({ email, providedCode, newPassword });

      if (error) {
         return res.status(401).json({
            success: false,
            message: error.details[0].message
         })
      }

      const codeValue = providedCode.toString()
      const existingHospital = await Hospital.findOne({ email }).select("+forgotPasswordCode +forgotPasswordCodeValidation")

      if (!existingHospital) {
         return res.status(401).json({
            success: false,
            message: 'Hospital does not exists!'
         })
      }

      if (!existingHospital.forgotPasswordCode || !existingHospital.forgotPasswordCodeValidation) {
         return res.status(400).json({
            success: false,
            message: 'something is wrong with the code!'
         })
      }
      if (Date.now() - existingHospital.forgotPasswordCodeValidation > 5 * 60 * 1000) {
         return res.status(400).json({
            success: false,
            message: 'code has been expired!'
         })
      }

      const hashedCodeValue = hmacProcces(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
      if (hashedCodeValue === existingHospital.forgotPasswordCode) {
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
const createHospital = async (req, res) => {
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
const getAllHospitals = async (req, res) => {
   try {
      const hospitals = await Hospital.find().sort({ createdAt: -1 })
      res.status(200).json(hospitals)
   } catch (error) {
      res.status(500).json(error)
   }
}

//Update Hospital
const updateHospital = async (req, res) => {
   try {
      const { id } = req.params;

      const updateData = {
         name: req.body.name,
         email: req.body.email,
         tel: req.body.tel,
         address: req.body.address,
         verified: req.body.verified,
         licenseNumber: req.body.licenseNumber,
      };

      // Handle uploaded file
      if (req.file) {
         updateData.officialDocument = req.file.filename;
      }

      const hospital = await Hospital.findByIdAndUpdate(
         id,
         updateData,
         { new: true }
      );

      if (!hospital) {
         return res.status(404).json({
            success: false,
            message: "Hospital not found",
         });
      }

      res.status(200).json({
         success: true,
         hospital,
      });
   } catch (error) {
      console.error(error);
      res.status(500).json({
         success: false,
         message: "Failed to update hospital",
      });
   }
};

//getOneHospital
const getOneHospital = async (req, res) => {
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
      res.status(200).json({ message: "Hospital deleted successfully" });
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
               _id: {
                  $cond: [
                     { $or: [{ $eq: ["$bloodgroup", null] }, { $eq: ["$bloodgroup", ""] }] },
                     "Unknown",
                     "$bloodgroup",
                  ],
               },
               count: { $sum: 1 },
            },
         },
         { $sort: { _id: 1 } } // Optional: sort by bloodgroup ascending
      ]);

      res.status(200).json(Hospitalstats);
   } catch (error) {
      res.status(500).json(error);
   }
};

// === Get logged-in hospital profile ===
const getMyProfile = async (req, res) => {
   try {
      const hospital = await Hospital.findById(req.user.userId);
      if (!hospital) {
         return res.status(404).json({ success: false, message: "Hospital not found" });
      }

      res.status(200).json(hospital);
   } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Error fetching profile" });
   }
};

// === Update profile info (text only) ===
const updateProfileInfo = async (req, res) => {
   try {
      const { id } = req.params;

      const updateData = {
         name: req.body.name,
         email: req.body.email,
         tel: req.body.tel,
         address: req.body.address,
         verified: req.body.verified,
         licenseNumber: req.body.licenseNumber,
      };

      if (req.file) {
         updateData.licenseDocument = "/uploads/" + req.file.filename;
      }

      const hospital = await Hospital.findByIdAndUpdate(id, updateData, { new: true });

      if (!hospital) {
         return res.status(404).json({ success: false, message: "Hospital not found" });
      }

      res.status(200).json({ success: true, hospital });
   } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Error updating profile info" });
   }
};

// === Upload profile picture only ===
const uploadProfilePicture = async (req, res) => {
   try {
      const hospital = await Hospital.findById(req.user.userId);
      if (!hospital) {
         return res.status(404).json({ success: false, message: "Hospital not found" });
      }

      hospital.profileImage = `/uploads/${req.file.filename}`;
      await hospital.save();

      res.status(200).json({
         success: true,
         message: "Profile picture uploaded",
         profileImage: hospital.profileImage,
      });
   } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Error uploading profile picture" });
   }
};

module.exports = {
   deleteHospital, getOneHospital, getAllHospitals, getHospitalStats, updateHospital, createHospital, signup, signin,
   sendVerificationCode, verifyVerificationCode, changePassword, sendForgotPasswordCode, verifyForgotPasswordCode, getMyProfile, updateProfileInfo, uploadProfilePicture
}