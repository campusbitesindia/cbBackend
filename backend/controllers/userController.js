const User = require("../models/User")
const Canteen = require("../models/Canteen")
const Campus = require("../models/Campus")
const sendEmail = require("../utils/forgotPassMail")
const JWT = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const sendEmailVerificationOTP = require("../utils/sendVerificationOTP")
const sendEmailVerificationModel = require("../models/emailVerification")
const crypto = require("crypto")
const axios=require("axios")
const mongoose = require("mongoose")
const { oauth2Client } = require("../utils/googleOAuthClient")

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, campus, phone } = req.body

    if (!name || !email || !password || !role || !campus) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        required: ["name", "email", "password", "role", "campus"],
        note: "For campus field, send either campus ID or campus name",
      })
    }

    if (!["student", "canteen", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Allowed roles: student, canteen, admin",
      })
    }

    if (role !== "canteen" && (!phone || !/^\d{10}$/.test(phone) || Number(phone) <= 0)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be exactly 10 digits and positive.",
      })
    }

    // Handle both campus ID and campus name
    let campusDoc
    if (mongoose.Types.ObjectId.isValid(campus)) {
      // If campus is a valid ObjectId, search by ID
      campusDoc = await Campus.findById(campus)
    } else {
      // Otherwise, search by name
      campusDoc = await Campus.findOne({ name: campus })
    }

    if (!campusDoc) {
      return res.status(400).json({
        success: false,
        message: "Campus not found. Please provide a valid campus ID or name.",
        availableCampuses: await Campus.find({ isDeleted: false }).select("_id name code city"),
      })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      const userInfo = {
        hasGoogleAuth: !!existingUser.googleId,
        isVerified: existingUser.is_verified || false,
        registrationMethod: existingUser.googleId ? "google" : "email",
      }

      let message = "An account with this email already exists."
      const suggestions = []

      if (!existingUser.password && existingUser.googleId) {
        const hashedPass=await bcrypt.hash(password,10);

        const user=await User.findOneAndUpdate({email},{password:hashedPass,campus:campusDoc._id,...(role !== "canteen" ? { phone } : {})},{new:true});

        sendEmailVerificationOTP(req, user)
            const token = JWT.sign(
            {
              id: user._id.toString(), // Ensure consistent string format
              email: user.email,
              role: user.role,
              campusId: campusDoc._id.toString(),
            },
            process.env.JWT_SECRET,
            { expiresIn: "200h" },
          )

          const options = {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            expires: new Date(Date.now() + 200 * 60 * 60 * 1000),
          }

          res.cookie("is_auth", true, options)
          res.cookie("token", token, options)

          // Consistent response format
          return res.status(200).json({
            success: true,
            message:
              role === "canteen"
                ? "Vendor registered successfully. Please verify your email. Your canteen is pending admin approval."
                : "User registered successfully. Please verify your email.",
            user: {
              id: user._id.toString(), // Consistent with token
              _id: user._id, // Keep for backward compatibility
              name: user.name,
              email: user.email,
              role: user.role,
              campus: {
                id: campusDoc._id.toString(),
                name: campusDoc.name,
                code: campusDoc.code,
              },
              canteenId: user.canteenId || null,
              isVerified: user.is_verified,
              approvalStatus: role === "canteen" ? "pending" : "approved",
            },
            token,
            nextSteps:
              role === "canteen"
                ? [
                    "Verify your email address",
                    "Wait for admin approval of your canteen",
                    "Once approved, you can start adding menu items",
                  ]
                : ["Verify your email address", "Complete your profile", "Start ordering from canteens"],
          })
      } else if (!userInfo.isVerified) {
        message = "An unverified account exists with this email."
        suggestions.push("Check your email for verification link")
        suggestions.push("Request a new verification email")
      } else {
        message = "An account with this email is already registered."
        suggestions.push("Sign in with your password")
        suggestions.push("Use 'Forgot Password' if you don't remember it")
      }

      return res.status(409).json({
        success: false,
        message,
        suggestions,
        userExists: true,
        userInfo,
      })
    }

    const hashedPass = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPass,
      role,
      campus: campusDoc._id,
      ...(role !== "canteen" ? { phone } : {}),
      is_verified: false,
    })

    // For vendors (canteen role), create a pending canteen that needs admin approval
    if (role === "canteen") {
      // Extract additional fields for canteen creation
      const {
        canteenName,
        mobile: canteenMobile,
        canteenEmail,
        address: canteenAddress,
        openingHours,
        closingHours,
        operatingDays,
      } = req.body

      // For registration, we'll create a basic canteen record
      // The vendor will need to complete the full onboarding process later
      const newCanteen = await Canteen.create({
        name: canteenName || `${name}'s Canteen`,
        campus: campusDoc._id,
        isOpen: false, // Closed until approved
        owner: user._id,
        isApproved: false,
        approvalStatus: "pending",

        // Basic required fields with placeholders
        adhaarNumber: "000000000000", // Will be updated during onboarding
        panNumber: "AAAAA0000A", // Will be updated during onboarding
        gstNumber: "00AAAAA0000A1Z5", // Will be updated during onboarding
        fssaiLicense: null,
        contactPersonName: name,

        // New required fields
        mobile: canteenMobile || phone || "0000000000", // Use provided mobile or phone
        email: canteenEmail || email, // Use canteen email or user email
        address: canteenAddress || "Address to be updated", // Placeholder address

        // Default operating hours
        operatingHours: {
          opening: openingHours || "09:00",
          closing: closingHours || "21:00",
        },
        operatingDays: operatingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

        images: [], // Will be added during onboarding
      })

      user.canteenId = newCanteen._id
      await user.save()
    }

    sendEmailVerificationOTP(req, user)

    const token = JWT.sign(
      {
        id: user._id.toString(), // Ensure consistent string format
        email: user.email,
        role: user.role,
        campusId: campusDoc._id.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "200h" },
    )

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now() + 200 * 60 * 60 * 1000),
    }

    res.cookie("is_auth", true, options)
    res.cookie("token", token, options)

    // Consistent response format
    return res.status(200).json({
      success: true,
      message:
        role === "canteen"
          ? "Vendor registered successfully. Please verify your email. Your canteen is pending admin approval."
          : "User registered successfully. Please verify your email.",
      user: {
        id: user._id.toString(), // Consistent with token
        _id: user._id, // Keep for backward compatibility
        name: user.name,
        email: user.email,
        role: user.role,
        campus: {
          id: campusDoc._id.toString(),
          name: campusDoc.name,
          code: campusDoc.code,
        },
        canteenId: user.canteenId || null,
        isVerified: user.is_verified,
        approvalStatus: role === "canteen" ? "pending" : "approved",
      },
      token,
      nextSteps:
        role === "canteen"
          ? [
              "Verify your email address",
              "Wait for admin approval of your canteen",
              "Once approved, you can start adding menu items",
            ]
          : ["Verify your email address", "Complete your profile", "Start ordering from canteens"],
    })
  } catch (error) {
    console.error("Registration Error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    })
  }
}

exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }
    const user1 = await User.findOne({ email })
    if (!user1) {
      return res.status(404).json({
        success: false,
        message: "Email doesn't exists",
      })
    }
    if (user1.is_verified) {
      return res.status(404).json({
        success: false,
        message: "Already verified",
      })
    }
    const emailver = await sendEmailVerificationModel.findOne({ userId: user1._id, otp })
    if (!emailver) {
      if (!user1.is_verified) {
        await sendEmailVerificationOTP(req, user1)
        return res.status(400).json({
          success: false,
          message: "Invalid OTP, new OTP sent to mail",
        })
      }
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      })
    }
    const currentTime = new Date()
    const expiretime = new Date(emailver.createdAt.getTime() + 15 * 60 * 1000)
    if (currentTime > expiretime) {
      await sendEmailVerificationOTP(req, user1)
      return res.status(400).json({
        success: false,
        message: "OTP expired, new OTP has been sent",
      })
    }
    user1.is_verified = true
    await user1.save()
    await sendEmailVerificationModel.deleteMany({ userId: user1._id })
    return res.status(200).json({ success: true, message: "Email verified successfully", user1 })
  } catch (error) {
    res.status(500).json({ success: false, message: `Unable to verify email: ${error}` })
  }
}

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Enter complete data.",
      })
    }

    const user1 = await User.findOne({ email })
    if (!user1) {
      // Track failed login attempt
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Check if user is Google OAuth user (no password)
    if (!user1.password) {
      return res.status(400).json({
        success: false,
        message: "This account was created with Google. Please use 'Sign in with Google' option.",
      })
    }

    // Generate JWT token
    const token = JWT.sign(
      {
        id: user1._id,
        email: user1.email,
        role: user1.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "120h" },
    )

    const option = {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now() + 200 * 60 * 60 * 1000),
    }
    res.cookie("token", token, option)
    res.cookie("is_auth", true, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now() + 200 * 60 * 60 * 1000),
    })

    // Enhanced response with security information
    const response = {
      success: true,
      user1: {
        _id: user1._id,
        name: user1.name,
        email: user1.email,
        role: user1.role,
        campus: user1.campus,
        profileImage: user1.profileImage,
      },
      token,
    }

    return res.status(200).json(response)
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({
      success: false,
      message: `Internal Server error: ${error.message}`,
    })
  }
}

exports.logoutUser = async (req, res, next) => {
  try {
    res.cookie("token", null, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now()),
    })

    res.cookie("is_auth", false, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      expires: new Date(Date.now()),
    })

    req.user = null
    return res.status(200).json({
      success: false,
      message: "Logged out successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Internal server error: ${error.message}`,
    })
  }
}

exports.forgotPass = async (req, res, next) => {
  const user1 = await User.findOne({ email: req.body.email })
  if (!user1) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    })
  }
  const resetToken = user1.getresetpass()
  await user1.save({ validateBeforeSave: false })

  const resetPassURL = `https://campus-bites-c7pe.vercel.app/resetPass/${resetToken}`

  const message = `Your password reset token is: \n\n ${resetPassURL} \n\nIf you have not send this request, please ignore.`

  try {
    await sendEmail({
      email: user1.email,
      subject: "Ecommerce Password recovery",
      message,
    })
    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      user1: req.user,
    })
  } catch (error) {
    user1.resetPasswordToken = undefined
    user1.resetPasswordExpite = undefined
    await user1.save({ validateBeforeSave: false })
    return res.status(500).json({
      success: false,
      message: `Internal server error: ${error}`,
    })
  }
}

exports.loadUser = async (req, res, next) => {
  try {
    const user1 = req.user
    if (!user1) {
      return res.status(400).json({
        success: false,
        message: "Currently not logged in",
      })
    }
    return res.status(200).json({
      success: true,
      user1,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal sever error",
      error,
    })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPass } = req.body
    if (!password || !confirmPass) {
      return res.status(401).json({
        success: false,
        message: "Enter complete data",
      })
    }
    if (password != confirmPass) {
      return res.status(400).json({
        success: false,
        message: "Password not matching",
      })
    }
    const tokenRecieved = crypto.createHash("sha256").update(req.params.token).digest("hex")
    const user1 = await User.findOne({ resetPasswordToken: tokenRecieved })
    if (!user1) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      })
    }
    const newPassword = await bcrypt.hash(password, 10)
    user1.password = newPassword
    user1.resetPasswordToken = undefined
    user1.resetPasswordExpire = undefined
    await user1.save()
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Internal server error: ${error}`,
    })
  }
}

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("campus", "name code city")
      .populate("canteenId", "name")
      .select("-password -resetPasswordToken -resetPasswordExpire")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    return res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get Profile Error:", error)
    return res.status(500).json({
      success: false,
      message: `Error fetching profile: ${error.message}`,
    })
  }
}

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, address, dateOfBirth } = req.body
    const userId = req.user.id

    // Find the user
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Update only provided fields
    const updateData = {}
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (bio) updateData.bio = bio
    if (address) updateData.address = address
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true })
      .populate("campus", "name code city")
      .populate("canteenId", "name")
      .select("-password -resetPasswordToken -resetPasswordExpire")

    // Add security event for profile update
    if (req.deviceInfo) {
      updatedUser.addSecurityEvent(
        "profile_update",
        `Profile updated from ${req.deviceInfo.deviceName}`,
        req.deviceInfo,
        "low",
      )
      await updatedUser.save()
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Update Profile Error:", error)
    return res.status(500).json({
      success: false,
      message: `Error updating profile: ${error.message}`,
    })
  }
}

exports.uploadProfileImage = async (req, res) => {
  try {
    const cloudinary = require("../utils/cloudinary")
    const userId = req.user.id

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      })
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "campus_bites/profiles",
      resource_type: "image",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    })

    // Update user profile image
    const updatedUser = await User.findByIdAndUpdate(userId, { profileImage: result.secure_url }, { new: true })
      .populate("campus", "name code city")
      .populate("canteenId", "name")
      .select("-password -resetPasswordToken -resetPasswordExpire")

    // Add security event for profile image update
    if (req.deviceInfo) {
      updatedUser.addSecurityEvent(
        "profile_image_update",
        `Profile image updated from ${req.deviceInfo.deviceName}`,
        req.deviceInfo,
        "low",
      )
      await updatedUser.save()
    }

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      user: updatedUser,
      imageUrl: result.secure_url,
    })
  } catch (error) {
    console.error("Upload Profile Image Error:", error)
    return res.status(500).json({
      success: false,
      message: `Error uploading profile image: ${error.message}`,
    })
  }
}
exports.getUserDetails=async(req,res)=>{
  try{
    const {code}=req.body;
    const googleRes=await oauth2Client.getToken(code);
    const userRes= await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );
    const {id:googleId,name,email,picture}=userRes.data;
    const isUser=await User.findOne({email});
    if(isUser){
      return res.status(400).json({
        success:false,
        message:"User with this email exist,Please try a new One"
      })
    }
    const user=await User.create({googleId:googleId,name,email,profileImage:picture,role:"student"});
    return res.status(200).json({
      success:true,
      message:"done",
      data:user
    })
  }
  catch(err){
    return res.status(500).json({
      success:false,
      message:"internal server Error",
      error:err.message
    })
  }
}