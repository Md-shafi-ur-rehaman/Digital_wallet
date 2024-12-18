const express = require("express");
const zod = require("zod");
const User = require("../models/user");
const Wallet = require("../models/wallet");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userVerification = require("../middleware/userVerification");

const userRouter = express.Router();

const signupBody = zod.object({
    email: zod.string().email(),
    name: zod.string(),
    phoneNumber: zod.number(),
    password: zod.string(),
    pin: zod.number()
});

userRouter.get("/", async (req, res)=>{
  try {
    // Retrieve token from cookies
    const token = req.cookies.token;

    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token, authorization denied.' 
      });
    }

    // Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    
    // If verified, find user (assuming you have a user model)
    const user = await User.findOne({email: verified.email}).select('-password').select('-pin');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    };

    // Attach user to request object
    res.status(200).json({
      success:true,
      message:'successfull'
    })
  }catch(err){
    return res.status(401).json({ 
      success: false, 
      message: err 
    });
  }
})

userRouter.post("/search", async(req, res)=>{
  const phoneNumber = req.body.phoneNumber;
  const user = await User.findOne({phoneNumber});

  if(!user){
    return res.json({
      name:null,
      isValid:false,
    })
  }
  
  res.status(200).json({
    name:user.name,
    phoneNumber:phoneNumber,
    isValid:true,
  })
})

userRouter.post("/register", async (req, res) => {
    // const { success } = signupBody.safeParse(req.body);
    // if (!success) {
    //   return res.status(411).json({
    //     message: "Incorrect inputs",
    //   });
    // }

    const {email, name, password, phoneNumber, pin} = req.body;

    if(!email || !name || !password || !phoneNumber || !pin) {
      return res.status(411).json({
        staus:false,
        message: "all inputs are required",
      });
    }
  
    const existingUser = await User.findOne({
      email: req.body.email,
    });
  
    if (existingUser) {
      return res.status(411).json({
        status:false,
        message: "Email already taken",
      });
    }
  
    
  
    const newUser = await User.create({email,name,phoneNumber,password,pin});
    const newWallet = await Wallet.create({user_id:newUser._id});
    const token = jwt.sign({email}, process.env.JWT_SECRET);
    
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res.status(200).json({
      status:true,
      message: "User created successfully",
      token: token,
    });
});

const signinBody = zod.object({
    email: zod.string().email(),
    password: zod.string(),
});

userRouter.post('/login', async (req, res)=>{
    // const { success } = signinBody.safeParse(req.body);
    // if (!success) {
    //   return res.status(411).json({
    //     message: "Incorrect inputs",
    //   });
    // }
    
    const {email, password} = req.body;
    const user = await User.findOne({email});
    
    
    if (!user) {
      return res.status(411).json({
          message: "Email is not registered"
      });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if(!isPasswordMatch){
      return res.status(411).json({
        message:"Crediantial is wrongn"
      })
    }

    const token = jwt.sign({email}, `${process.env.JWT_SECRET}`);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res.status(200).json({
      message: "Login successfull",
      success: true,
      token: token,
    });
})

// Route to get user profile
userRouter.get('/user/profile', userVerification, (req, res) => {
  // req.user is available from the verification middleware
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      name: req.user.name,
      // Include other non-sensitive user information
    }
  });
});

userRouter.get('/user', userVerification, (req, res) => {
  // req.user is available from the verification middleware
  res.json({
    success: true,
    user: {
      id: req.user._id,
      phoneNumber:req.user.phoneNumber,
      email: req.user.email,
      name: req.user.name,
      // Include other non-sensitive user information
    }
  });
});

// Logout router
userRouter.post('/logout', (req, res) => {
  // Clear the token cookie
  res.clearCookie('token', {
    httpOnly: true,
    // secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

module.exports = userRouter;