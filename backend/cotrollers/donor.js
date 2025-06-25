const jwt = require("jsonwebtoken");
const { signupSchema, signinSchema, changePasswordSchema, acceptCodeSchema, acceptForgotPasswordCodeSchema } = require("../middlewares/validator");
const Donor = require("../Models/Donor");
const Donation = require('../Models/donation');
const { transport } = require('../middlewares/sendMail');
const dotenv = require("dotenv");
dotenv.config();
const { doHash, doHashValidation, hmacProcces } = require("../utils/hasing");
const { sendverificationemail } = require('../utils/emailHelpers');
const { sendforgotpasswordcode } = require('../utils/emailHelpers');

const signup = async (req, res) => {
   const { name, email, password, tel, address } = req.body;

   try {
      const { error } = signupSchema.validate({ email, password });
      if (error) {
         return res.status(400).json({ success: false, message: error.details[0].message });
      }

      const existingDonor = await Donor.findOne({ email });
      if (existingDonor) {
         return res.status(400).json({ success: false, message: 'Email already registered.' });
      }

      const hashedPassword = await doHash(password, 12);

      const donor = new Donor({
         name,
         email,
         password: hashedPassword,
         tel,
         address,
      });

      await donor.save();

      await transport.sendMail({
         to: donor.email,
         from: process.env.EMAIL_USER,
         subject: "🎉 Welcome to BloodBridge!",
         html: `
            <div style="font-family: Arial, sans-serif; background-color: #f5f6fa; padding: 30px;">
               <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
               <div style="background-color: #e63946; padding: 20px; color: white; text-align: center;">
                  <h1 style="margin: 0;">Welcome to BloodBridge!</h1>
               </div>
               <div style="padding: 30px; text-align: left; color: #333;">
                  <p style="font-size: 18px;">Hi <strong>${donor.name}</strong>,</p>
                  <p style="font-size: 16px; line-height: 1.6;">
                     Thank you for registering with <strong>BloodBridge</strong> — your contribution can save lives!
                  </p>
                  <p style="font-size: 16px; line-height: 1.6;">
                     You're now part of a community of heroes. Just one more step:
                  </p>
                  <div style="text-align: center; margin: 30px 0;">
                     <a href="http://localhost:5173/donorverifycode" style="background-color: #1d3557; color: #fff; text-decoration: none; padding: 15px 25px; font-size: 16px; border-radius: 5px;">
                     ✅ Verify Your Email
                     </a>
                  </div>
                  <p style="font-size: 15px; color: #555;">The link will take you to our secure verification page where you’ll enter your code. Check your inbox for it!</p>
                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                  <p style="font-size: 14px; color: #999; text-align: center;">
                     Stay safe. Stay strong. <br/>Thank you for being a hero! ❤️<br/><br/>
                     — The BloodBridge Team
                  </p>
               </div>
               </div>
            </div>
         `
      });

      res.status(201).json({
         success: true,
         message: 'Donor registered. Now verify your email.',
      });

   } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({ success: false, message: 'Server error' });
   }
};

const signin = async (req, res) => {
   const { email, password } = req.body;
   try {
      const { error } = signinSchema.validate({ email, password });

      if (error) {
         return res.status(401).json({
            success: false,
            message: error.details[0].message
         })
      }

      const existingDonor = await Donor.findOne({ email }).select('+password');
      if (!existingDonor) {
         return res.status(401).json({
            success: false,
            message: 'User does not exists!'
         })
      }

      const result = await doHashValidation(password, existingDonor.password)
      if (!result) {
         return res.status(401).json({
            success: false,
            message: 'Invalid Credentials'
         })
      }

      // ✅ Add role: 'donor'
      const token = jwt.sign(
         {
            userId: existingDonor._id,
            email: existingDonor.email,
            verified: existingDonor.verified,
         },
         process.env.JWT_SEC,
         {
            expiresIn: '8h'
         }
      );

      if (!existingDonor.verified) {
         return res.status(401).json({
            success: false,
            message: 'Please verify your email before logging in.'
         });
      }

      // ✅ Clear hospital token if it exists
      res.clearCookie('hospitalToken');

      // ✅ Set token cookie
      res.cookie('donorToken', token, {
         secure: process.env.NODE_ENV === 'production',
         expires: new Date(Date.now() + 8 * 3600000),
         httpOnly: true,
         sameSite: 'Lax'
      });

      res.status(200).json({
         success: true,
         token,
         message: 'Donor logged in successfully',
         user: {
            id: existingDonor._id,
            email: existingDonor.email,
            name: existingDonor.name,
            password: existingDonor.password,
            tel: existingDonor.tel,
            address: existingDonor.address,
            bloodgroup: existingDonor.bloodgroup,
            weight: existingDonor.weight,
            disease: existingDonor.disease,
            age: existingDonor.age,
            verified: existingDonor.verified,
            profileImage: existingDonor.profileImage || null,
         }
      })
   } catch (error) {
      console.log(error)
   }
}

const sendVerificationCode = async (req, res) => {
   const { email } = req.body;

   if (!email) {
      return res.status(400).json({ message: "Email is required" });
   }

   try {
      const existingDonor = await Donor.findOne({ email });
      if (!existingDonor) {
         return res.status(404).json({ success: false, message: 'Donor does not exist!' });
      }

      if (existingDonor.verified) {
         return res.status(400).json({ success: false, message: 'You are already verified!' });
      }

      const codeValue = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedCodeValue = hmacProcces(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);

      const msg = {
         to: existingDonor.email,
         from: process.env.EMAIL_USER,
         subject: '🔐 Email Verification Code',
         html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 30px; border-radius: 10px;">
               <h2 style="color: #d32f2f; text-align: center;">Blood Donation Platform</h2>
               <p style="font-size: 18px; color: #333;">Hello <strong>${existingDonor.name}</strong>,</p>
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

      await transport.sendMail(msg)
         .then(() => console.log("Email sent successfully"))
         .catch(err => {
            console.error("Email sending failed:", err);
         });

      existingDonor.verificationCode = hashedCodeValue;
      existingDonor.verificationCodeValidation = Date.now();
      await existingDonor.save();

      return res.status(200).json({ success: true, message: 'Code sent!' });

   } catch (error) {
      console.log(error);
      res.status(500).json({
         success: false,
         message: 'An error occurred while sending the verification code.'
      });
   }
};

const verifyVerificationCode = async (req, res) => {
   const { email, providedCode } = req.body;
   try {
      const { error } = acceptCodeSchema.validate({ email, providedCode });
      if (error) {
         return res.status(401).json({
            success: false,
            message: error.details[0].message
         });
      }

      const existingDonor = await Donor.findOne({ email }).select("+verificationCode +verificationCodeValidation");
      if (!existingDonor) {
         return res.status(404).json({ success: false, message: 'User does not exist!' });
      }

      if (existingDonor.verified) {
         return res.status(400).json({ success: false, message: 'You are already verified!' });
      }

      if (!existingDonor.verificationCode || !existingDonor.verificationCodeValidation) {
         return res.status(400).json({ success: false, message: 'No valid code found!' });
      }

      const isExpired = Date.now() - existingDonor.verificationCodeValidation > 5 * 60 * 1000;
      if (isExpired) {
         return res.status(400).json({ success: false, message: 'Code has expired!' });
      }

      const hashedCodeValue = hmacProcces(providedCode.toString(), process.env.HMAC_VERIFICATION_CODE_SECRET);
      if (hashedCodeValue !== existingDonor.verificationCode) {
         return res.status(400).json({ success: false, message: 'Invalid verification code!' });
      }

      existingDonor.verified = true;
      existingDonor.verificationCode = undefined;
      existingDonor.verificationCodeValidation = undefined;
      await existingDonor.save();

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
      const { error } = changePasswordSchema.validate({ oldPassword, newPassword });
      if (error) {
         return res.status(400).json({ success: false, message: error.details[0].message });
      }

      if (!verified) {
         return res.status(403).json({ success: false, message: 'You are not a verified user.' });
      }

      const donor = await Donor.findById(userId).select("+password");
      if (!donor) {
         return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isPasswordValid = await doHashValidation(oldPassword, donor.password);
      if (!isPasswordValid) {
         return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      donor.password = await doHash(newPassword, 12);
      await donor.save();

      // Send password change notification email via MailerSend SMTP
      try {
         await transport.sendMail({
            to: donor.email,
            from: process.env.EMAIL_USER,
            subject: "Your password has been changed",
            html: `<p>Hello ${donor.name || ''},</p>
                   <p>Your password was recently changed. If you did not perform this action, please contact our support team immediately.</p>`
         });
      } catch (mailErr) {
         console.error("Failed to send password change email:", mailErr.message);
      }

      return res.status(200).json({ success: true, message: "Password updated successfully" });

   } catch (error) {
      console.error("Change password error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
   }
};

const sendForgotPasswordCode = async (req, res) => {
   const { email } = req.body;
   try {
      const existingDonor = await Donor.findOne({ email });
      if (!existingDonor) {
         return res.status(404).json({ success: false, message: 'User does not exist!' });
      }

      const codeValue = Math.floor(100000 + Math.random() * 900000).toString();

      const msg = {
         to: existingDonor.email,
         from: process.env.EMAIL_USER,
         subject: '🔒 Reset Your Password',
         html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 30px; border-radius: 10px;">
               <h2 style="color: #d32f2f; text-align: center;">Password Reset Request</h2>
               <p style="font-size: 18px; color: #333;">Dear <strong>${existingDonor.name}</strong>,</p>
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

      const hashedCodeValue = hmacProcces(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET);
      existingDonor.forgotPasswordCode = hashedCodeValue;
      existingDonor.forgotPasswordCodeValidation = Date.now();
      await existingDonor.save();

      return res.status(200).json({ success: true, message: 'Code sent!' });

   } catch (error) {
      console.log(error);
      res.status(500).json({
         success: false,
         message: 'An error occurred while sending the forgot password code.'
      });
   }
};

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
      const existingDonor = await Donor.findOne({ email }).select("+forgotPasswordCode +forgotPasswordCodeValidation")

      if (!existingDonor) {
         return res.status(401).json({
            success: false,
            message: 'Donor does not exists!'
         })
      }

      if (!existingDonor.forgotPasswordCode || !existingDonor.forgotPasswordCodeValidation) {
         return res.status(400).json({
            success: false,
            message: 'something is wrong with the code!'
         })
      }
      if (Date.now() - existingDonor.forgotPasswordCodeValidation > 5 * 60 * 1000) {
         return res.status(400).json({
            success: false,
            message: 'code has been expired!'
         })
      }

      const hashedCodeValue = hmacProcces(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
      if (hashedCodeValue === existingDonor.forgotPasswordCode) {
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

      if (password) {
         password = await doHash(password, 12); // bcrypt hash instead of AES
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
               _id: "$bloodgroup", // Group by blood group
               totalDonated: { $sum: "$donationAmount" }, // Sum donation amounts
            },
         },
         {
            $project: {
               _id: 0,
               bloodGroup: "$_id",
               totalDonated: 1,
            },
         },
         { $sort: { bloodGroup: 1 } }, // Optional: sort by blood group
      ]);

      res.status(200).json(stats);
   } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal server error" });
   }
};

const getBloodGroupStats = async (req, res) => {
   try {
      const stats = await Donor.aggregate([
         { $unwind: "$donationHistory" }, // Decompose the array
         {
            $group: {
               _id: "$donationHistory.bloodgroup",
               totalDonated: { $sum: "$donationHistory.amount" },
            },
         },
         {
            $project: {
               _id: 0,
               bloodGroup: "$_id",
               totalDonated: 1,
            },
         },
         { $sort: { bloodGroup: 1 } }
      ]);

      res.status(200).json(stats);
   } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch blood group stats" });
   }
};

// Fetch logged-in donor's profile
const getMyProfile = async (req, res) => {
   try {
      const donor = await Donor.findById(req.user.userId)

      if (!donor) return res.status(404).json({ message: "Donor not found" });

      res.status(200).json(donor);
   } catch (err) {
      console.error('getMyProfile error:', err);
      res.status(500).json({ message: "Failed to fetch profile" });
   }
};

// Update donor profile
const updateProfile = async (req, res) => {
   try {
      const donor = await Donor.findById(req.params.id);

      if (!donor) {
         return res.status(404).json({ success: false, message: "Donor not found" });
      }

      const fields = ["name", "email", "tel", "address", "age", "weight", "bloodgroup"];
      fields.forEach((field) => {
         if (req.body[field]) {
            donor[field] = req.body[field];
         }
      });

      await donor.save();

      res.status(200).json({
         success: true,
         message: "Profile updated successfully",
         donor,
      });
   } catch (error) {
      console.error("Update profile by ID error:", error);
      res.status(500).json({ success: false, message: "Server error" });
   }
};

const getDonationHistory = async (req, res) => {
   try {
      const donor = await Donor.findById(req.user.userId || req.user.id); // ✅ Correct user ID

      if (!donor) {
         return res.status(404).json({ message: "Donor not found" });
      }

      res.status(200).json({ donations: donor.donationHistory }); // Better wrapped in key
   } catch (err) {
      console.error("Donation history error:", err);
      res.status(500).json({ message: "Failed to fetch donation history", error: err.message });
   }
};

const getTopDonors = async (req, res) => {
   try {
      const donors = await Donor.find()
         .sort({ numberOfDonations: -1 })
         .limit(4)
         .select("name bloodgroup profileImage numberOfDonations verified");

      const donorsWithRatingAndMedal = donors.map((donor) => {
         const rating = Math.min(5, donor.numberOfDonations * 0.5);

         let medal = null;
         if (rating >= 4.5) medal = "Gold";
         else if (rating >= 3.5) medal = "Silver";
         else if (rating >= 2.5) medal = "Bronze";

         return { ...donor.toObject(), rating, medal };
      });

      res.status(200).json({ topDonors: donorsWithRatingAndMedal });
   } catch (err) {
      console.error("Failed to get top donors:", err);
      res.status(500).json({ message: "Failed to get top donors" });
   }
};

const donateBlood = async (req, res) => {
   const { donorId, age, weight, disease = "none", amount, donationDate, bloodgroup } = req.body;

   if (!bloodgroup) {
      return res.status(400).json({ success: false, message: 'Bloodgroup is required for donation.' });
   }

   try {
      const donor = await Donor.findById(donorId);
      if (!donor) {
         return res.status(404).json({ success: false, message: 'Donor not found' });
      }

      const date = donationDate ? new Date(donationDate) : new Date();
      if (isNaN(date.getTime())) {
         return res.status(400).json({ success: false, message: 'Invalid donation date' });
      }

      if (age < 18 || weight < 50 || disease.trim().toLowerCase() !== "none") {
         return res.status(400).json({
            success: false,
            message: 'Donor is not eligible to donate (must be >=18, >=50kg, and disease-free)',
         });
      }

      if (donor.lastDonationDate) {
         const daysSinceLast = Math.floor((date - donor.lastDonationDate) / (1000 * 60 * 60 * 24));
         if (daysSinceLast < 56) {
            return res.status(400).json({
               success: false,
               message: `Next eligible donation date: ${donor.nextDonationDate?.toDateString()}`,
            });
         }
      }

      donor.donationHistory.push({
         amount,
         date,
         disease,
         bloodgroup,  // required here
         age,
         weight,
      });

      donor.lastDonationDate = date;
      donor.nextDonationDate = new Date(date.getTime() + 56 * 24 * 60 * 60 * 1000);
      donor.donationAmount += amount;
      donor.numberOfDonations += 1;
      donor.age = age;
      donor.weight = weight;

      await donor.save();

      res.status(201).json({
         success: true,
         message: 'Donation recorded successfully',
         donor,
      });

   } catch (err) {
      console.error("Donation error:", err);
      res.status(500).json({ success: false, message: 'Server error' });
   }
};

const updateDonorByAdmin = async (req, res) => {
  try {
    const donorId = req.params.id;

    const updatedData = { ...req.body };

    // Optional image upload logic
    if (req.file) {
      const imageBuffer = req.file.buffer;
      const result = await uploadToCloudinary(imageBuffer);
      updatedData.profileImage = result.secure_url;
    }

    const donor = await Donor.findByIdAndUpdate(donorId, updatedData, {
      new: true,
    });

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    res.status(200).json({ message: 'Donor updated', donor });
  } catch (err) {
    console.error('Admin update error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// controllers/donorController.js
const getDonationsPerYear = async (req, res) => {
  try {
    const result = await Donor.aggregate([
      { $unwind: "$donationHistory" },
      {
        $group: {
          _id: { $year: "$donationHistory.date" },
          totalDonations: { $sum: 1 }, // Or $sum: "$donationHistory.amount" if you want units
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id",
          totalDonations: 1,
        },
      },
      { $sort: { year: 1 } }
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching donations per year:", error);
    res.status(500).json({ message: "Failed to fetch donations per year" });
  }
};



module.exports = {
   deleteDonor, getOneDonor, getAllDonor, getDonorStats, updateDonor, createDonor, signin, signup,
   sendVerificationCode, verifyVerificationCode, changePassword, sendForgotPasswordCode, verifyForgotPasswordCode,
   getBloodGroupStats, getMyProfile, updateProfile, getTopDonors, getDonationHistory, donateBlood, updateDonorByAdmin, getDonationsPerYear
}