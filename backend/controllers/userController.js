const User = require("../models/User");
const Canteen = require("../models/Canteen");
const Campus = require("../models/Campus");
const sendEmail = require("../utils/forgotPassMail");
const JWT = require("jsonwebtoken");
const bcrypt=require("bcryptjs");
const sendEmailVerificationOTP = require("../utils/sendVerificationOTP");
const sendEmailVerificationModel= require("../models/emailVerification");
const crypto = require("crypto");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, campus } = req.body;

    if (!name || !email || !password || !role || !campus) {
      return res.status(400).json({ message: "Give complete Data" });
    }

    if (!["student", "canteen", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const campusDoc = await Campus.findOne({ name: campus });
    if (!campusDoc) {
      return res.status(400).json({ message: "Campus not found." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email." });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPass,
      role,
      campus: campusDoc._id
    });

    if (role === "canteen") {
      const newCanteen = await Canteen.create({
        name: `${name}'s Canteen`,
        campus: campusDoc._id,
        isOpen: true,
        owner: user._id
      });
      user.canteenId = newCanteen._id;
      await user.save();
    }

    sendEmailVerificationOTP(req, user);

    const token = JWT.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "200h" }
    );

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now() + 200 * 60 * 60 * 1000)
    };

    res.cookie("is_auth", true, options);
    res.cookie("token", token, options);

    return res.status(200).json({
      success: true,
      user,
      token
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      message: "Server error during registration",
      error: error.message
    });
  }
};

exports.verifyEmail=async(req, res)=>{
    try{
        const {email, otp}=req.body;
        if(!email || !otp){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            });
        }
        const user1 = await User.findOne({email});
        if(!user1){
            return res.status(404).json({
                success:false,
                message:"Email doesn't exists"
            })
        }
        if(user1.is_verified){
            return res.status(404).json({
                success:false,
                message:"Already verified"
            })
        }
        const emailver = await sendEmailVerificationModel.findOne({userId: user1._id, otp});
        if(!emailver){
            if(!user1.is_verified){
                await sendEmailVerificationOTP(req, user1);
                return res.status(400).json({
                    success:false,
                    message: "Invalid OTP, new OTP sent to mail"
                })
            }
            return res.status(400).json({
                success:false,
                message:"Invalid OTP"
            })
        }
        const currentTime = new Date();
        const expiretime=new Date(emailver.createdAt.getTime() + 15*60*1000);
        if(currentTime > expiretime){
            await sendEmailVerificationOTP(req, user1);
            return res.status(400).json({
                success:false,
                message:"OTP expired, new OTP has been sent"
            })
        }
        user1.is_verified=true;
        await user1.save();
        await sendEmailVerificationModel.deleteMany({userId: user1._id});
        return res.status(200).json({success:true, message:"Email verified successfully", user1});
     }catch(error){
        res.status(500).json({success: false, message: `Unable to verify email: ${error}`})
    }
}

exports.loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Enter complete data."
            });
        }
        
        const user1 = await User.findOne({ email });
        if (!user1) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const comp = await bcrypt.compare(password, user1.password);
        if (!comp) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = JWT.sign({ id: user1._id, email: user1.email }, process.env.JWT_SECRET, { expiresIn: '120h' });
        const option = {
            httpOnly: false,
            secure: true,  
            sameSite: "none",
            expires: new Date(Date.now() + 200 * 60 * 60 * 1000) 
        };

        res.cookie('token', token, option);
        res.cookie('is_auth', true, {
            httpOnly: false,
            secure: true,
            sameSite: "none",
            expires: new Date(Date.now() + 200 * 60 * 60 * 1000)
        });

        return res.status(200).json({
            success: true,
            user1,
            token
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Internal Server error: ${error}`
        });
    }
};

exports.logoutUser = async (req, res, next) => {
    try {
        res.cookie('token', null, {
            httpOnly: false,
            secure: true, 
            sameSite: "none",
            expires: new Date(Date.now()) 
        });

        res.cookie('is_auth', false, {
            httpOnly: false, 
            secure: true, 
            sameSite: "none",
            expires: new Date(Date.now()) 
        });

        req.user = null; 
        return res.status(200).json({
            success: false,
            message: "Logged out successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Internal server error: ${error.message}` 
        });
    }
};

exports.forgotPass = async (req, res, next) => {
    const user1 = await User.findOne({ email: req.body.email });
    if (!user1) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const resetToken = user1.getresetpass();
    await user1.save({ validateBeforeSave: false });
  
    const resetPassURL = `http://localhost:3000/resetPass/${resetToken}`;
  
    const message = `Your password reset token is: \n\n ${resetPassURL} \n\nIf you have not send this request, please ignore.`;
  
    try {
      await sendEmail({
        email: user1.email,
        subject: "Ecommerce Password recovery",
        message,
      });
      return res.status(200).json({
        success: true,
        message: "Email sent successfully",
        user1: req.user,
      });
    } catch (error) {
      user1.resetPasswordToken = undefined;
      user1.resetPasswordExpite = undefined;
      await user1.save({ validateBeforeSave: false });
      return res.status(500).json({
        success: false,
        message: `Internal server error: ${error}`,
      });
    }
};

exports.loadUser=async(req, res, next)=>{
    try{
        const user1=req.user;
        if(!user1){
            return res.status(400).json({
                success:false,
                message:"Currently not logged in"
            })
        }
        return res.status(200).json({
            success:true,
            user1
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal sever error", error
        })
    }
}

exports.resetPassword= async(req, res)=>{
    try{
        const {password, confirmPass} = req.body;
        if(!password || !confirmPass){
            return res.status(401).json({
                success:false,
                message:"Enter complete data"
            })
        }
        if(password != confirmPass){
            return res.status(400).json({
                success:false,
                message:"Password not matching"
            })
        } 
        const tokenRecieved=crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user1=await User.findOne({resetPasswordToken:tokenRecieved});
        if(!user1){
            return res.status(400).json({
                success:false,
                message:"Invalid request"
            })
        }
        const newPassword=await bcrypt.hash(password, 10);
        user1.password=newPassword;
        user1.resetPasswordToken=undefined;
        user1.resetPasswordExpire=undefined
        await user1.save();
        return res.status(200).json({
            success:true,
            message:"Password changed successfully"
        })
    }catch(error){
        return res.status(500).json({
            success: false,
            message: `Internal server error: ${error}`,
        });    
    }
}
