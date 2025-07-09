const CryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
const Admin = require("../Models/Admin");
const dotenv = require("dotenv");
const Donor = require("../Models/Donor");
const Hospital = require("../Models/Hospital");
dotenv.config();

// REGISTER Admin
// ✅ GOOD: consistent encryption like registerAdmin
const registerAdmin = async (req, res) => {
  try {
    if (!process.env.PASS) {
      return res.status(500).json({ error: "Encryption key not configured" });
    }
    const encryptedPassword = CryptoJs.AES.encrypt(
      req.body.password,
      process.env.PASS
    ).toString();

    const newAdmin = new Admin({
      name: req.body.name,
      email: req.body.email,
      password: encryptedPassword,
    });

    const admin = await newAdmin.save();
    res.status(201).json(admin);
  } catch (error) {
    res.status(500).json(error);
  }
};

// LOGIN Admin
const loginAdmin = async (req, res) => {
  try {
    const user = await Admin.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: "Admin not registered" });
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

    res.cookie("adminToken", accessToken, {
      httpOnly: true,
      secure: false, // true in production (with HTTPS)
      sameSite: "Lax"
    });

    res.status(200).json({ ...info, accessToken });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

//Create Admin
const createAdmin = async (req, res) => {
  try {
    const newAdmin = Admin(req.body);
    const admin = await newAdmin.save();
    res.status(201).json(admin);
  } catch (error) {
    res.status(500).json(error);
  }
}

//Update admin
const updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;

    const { name, email } = req.body;

    const updated = await Admin.findByIdAndUpdate(
      adminId,
      { name, email },
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      admin: updated
    });

  } catch (error) {
    console.error("Update admin profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


//delete admin
const deleteAdmin = async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.status(201).json("Admin deleted Successfully");
  } catch (error) {
    res.status(500).json(error)
  }
}

// Fetch logged-in admin profile
const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;

    const admin = await Admin.findById(adminId).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateDonorByAdmin = async (req, res) => {
  try {
    const donorId = req.params.id;

    const updatedData = { ...req.body };

    const { bloodgroup, disease, ...rootFields } = updatedData;

    const donor = await Donor.findByIdAndUpdate(
      donorId,
      rootFields,
      { new: true }
    );

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    if (bloodgroup || disease) {
      const update = {};
      if (bloodgroup) {
        update['donationHistory.0.bloodgroup'] = bloodgroup;
      }
      if (disease) {
        update['donationHistory.0.disease'] = disease;
      }
      await Donor.updateOne(
        { _id: donorId },
        { $set: update }
      );
    }

    const updatedDonor = await Donor.findById(donorId);

    res.status(200).json({
      message: 'Donor updated',
      donor: updatedDonor
    });
  } catch (err) {
    console.error('Admin update error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateHospitalByAdmin = async (req, res) => {
  try {
    const hospitalId = req.params.id;

    // Parse incoming fields safely
    const updatedData = {
      name: req.body.name,
      email: req.body.email,
      tel: req.body.tel,
      address: req.body.address,
      verified:
        req.body.verified === "true" || req.body.verified === true,
      licenseNumber: req.body.licenseNumber,
    };

    // Handle file upload
    if (req.file) {
      updatedData.officialDocument = req.file.filename;
    }

    const hospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      updatedData,
      { new: true }
    );

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    res.status(200).json({
      message: "Hospital updated successfully",
      hospital,
    });
  } catch (err) {
    console.error("Admin update hospital error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


const changeAdminPassword = async (req, res) => {
  try {
    const adminId = req.user.id;

    const { currentPassword, newPassword } = req.body;

    if (!process.env.PASS) {
      return res.status(500).json({ message: "Encryption key not configured" });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Decrypt current stored password
    const decrypted = CryptoJs.AES.decrypt(admin.password, process.env.PASS);
    const originalPassword = decrypted.toString(CryptoJs.enc.Utf8);

    if (originalPassword !== currentPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const encryptedPassword = CryptoJs.AES.encrypt(
      newPassword,
      process.env.PASS
    ).toString();

    admin.password = encryptedPassword;
    await admin.save();

    res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Change admin password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  loginAdmin, registerAdmin, createAdmin, updateAdminProfile, deleteAdmin, updateHospitalByAdmin, getAdminProfile,
  updateDonorByAdmin, updateHospitalByAdmin, changeAdminPassword
}