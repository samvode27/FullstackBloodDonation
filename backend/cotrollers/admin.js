const CryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
const Admin = require("../Models/Admin");
const dotenv = require("dotenv");
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
const updateAdmin = async (req, res) => {
  try {
    const updateAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
    res.status(201).json(updateAdmin)
  } catch (error) {
    res.status(500).json(error)
  }
}

//delete admin
const deleteAdmin = async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.status(201).json("Admin deleted Successfully");
  } catch (error) {
    res.status(500).json(error)
  }
}

module.exports = { loginAdmin, registerAdmin, createAdmin, updateAdmin, deleteAdmin }