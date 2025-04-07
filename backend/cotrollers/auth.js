const CryptoJs = require("crypto-js")
const jwt = require("jsonwebtoken")
const User = require("../Models/User")
const dotenv = require("dotenv")
dotenv.config();

//Register
const registerUser = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({ error: "Name is required" });
        }
        if (!req.body.email) {
            return res.status(400).json({ error: "Email is required" });
        }
        if (!req.body.password) {
            return res.status(400).json({ error: "Password is required" });
        }

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: CryptoJs.AES.encrypt(
                req.body.password,
                process.env.PASS
            ).toString(),
            role: req.body.role || "user"  // ✅ Set default role if not provided
        });

        const user = await newUser.save();
        res.status(201).json(user);
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

//Login
const loginUser = async (req, res) => {
   try {
      const user = await User.findOne({email: req.body.email})

      if(!user){
         return res.status(401).json("You have not registered");                                                                                          
      }        
      
      const hashedPassword = CryptoJs.AES.decrypt(
         user.password,
         process.env.PASS                                                                                              
      );

      const originalPassword = hashedPassword.toString(CryptoJs.enc.Utf8);

      if(originalPassword !== req.body.password){
         return res.status(500).json("Wrong Password");                                                                                                                                                                                   
      }

      const {password, ...info} = user._doc;
      const accessToken = jwt.sign(
         {id: user._id, role: user.role},
         process.env.JWT_SEC,
         {expiresIn: "10d"}                                                                                               
      );
      res.status(200).json({...info, accessToken});

   } catch (error) {
      res.status(500).json(error);                                                                                                 
   }
}

module.exports = {registerUser, loginUser}