const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



exports.register = async (req, res) => {
    try {
        const { name, email, price, role } = req.body;

        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

    
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        const newUser = new User({ name, email, password: hashedPassword, role });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.login=async(req,res)=>{
    try{
      const{email,password}=req.body

        const existingUser=await User.findOne({email})

        if(!existingUser){
         return res.status(400).json({message:"User not found"})
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: existingUser._id, email: existingUser.email, role: existingUser.role },
            process.env.JWT_SECRET, 
            { expiresIn: "1h" } 
        );

        res.status(200).json({ message: "Login successful", token, user: existingUser,status:true });

    }catch(error){
        console.error(error)
        res.status(500).json({message:"server error"})
    }
}

