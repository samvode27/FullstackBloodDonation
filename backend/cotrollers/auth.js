const CryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const dotenv = require("dotenv");
dotenv.config();

// Register User
const registerUser = async (req, res) => {            
        
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: CryptoJs.AES.encrypt(
                req.body.password, 
                process.env.PASS 
            ).toString()
        });

    try {
        const user = await newUser.save();
        res.status(201).json(user);

    } catch (error) {
        res.status(500).json(error);
    }
};


// Login User
// const loginUser = async (req, res) => {
//     try {
//         // Find the user by email
//         const user = await User.findOne({ email: req.body.email });

//         if (!user) {
//             return res.status(401).json("You have not registered");
//         }

//         const hashedPassword = CryptoJs.AES.decrypt(
//             user.password,
//             process.env.PASS
//         )

//         const originalPassword = hashedPassword.toString(CryptoJs.enc.Utf8)

//         if (originalPassword !== req.body.password) {
//             return res.status(500).json("Wrong Password");
//         }

//         // Remove password from the response and create a JWT
//         const { password, ...info } = user._doc;
//         const accessToken = jwt.sign(
//             { id: user._id, role: user.role }, 
//             process.env.JWT_SEC,  // Ensure this is the same secret used in other parts of your app
//             { expiresIn: "10d" }
//         );

//         res.status(200).json({ ...info, accessToken });
//     } catch (error) {
//         res.status(500).json(error);
//     }
// };
// Login User
const loginUser = async (req, res) => {
    try {
        // Find the user by email
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(401).json("You have not registered");
        }

        // Decrypt the stored password
        const decryptedPassword = CryptoJs.AES.decrypt(
            user.password,
            process.env.PASS
        );

        // Convert the decrypted password to a string (Utf8)
        const originalPassword = decryptedPassword.toString(CryptoJs.enc.Utf8);

        // Compare the decrypted password with the entered password
        if (originalPassword !== req.body.password) {
            return res.status(500).json("Wrong Password");
        }

        // Remove password from the response and create a JWT
        const { password, ...info } = user._doc;
        const accessToken = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SEC,  // Ensure this is the same secret used in other parts of your app
            { expiresIn: "10d" }
        );

        res.status(200).json({ ...info, accessToken });
    } catch (error) {
        res.status(500).json(error);
    }
};




module.exports = { registerUser, loginUser };
