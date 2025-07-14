const jwt = require("jsonwebtoken");
const user = require("../models/User.js");
exports.isAuthenticated = async (req, res, next) => {
    try {
      
       const token =   req.cookies.token || req.header("Authorization").replace("Bearer ","") ;
       if(token=="j:null"){
            return res.status(401).json({
                success:false,
                message:"Not logged in currently"
            })
       }
       const decodedData= jwt.verify(token, process.env.JWT_SECRET);
       const user1=await user.findOne({email: decodedData.email})
       if(!user1){
        return res.status(401).json({
            success:false,
            message:"Not logged in currently"
        })
       }
       req.user=user1;
       next(); 
    } catch (error) {
       res.status(500).json({
          success: false,
          message: `Internal server errorrrrrr: ${error}`,
       });
    }
 };


 exports.isStudent=async(req,res,next)=>{
   try{
      const role=req.user.role;
      if(role!=="student"){
         return res.status(401).json({
            success:false,
            message:"this is protect Route for Student"
         })
      }
     
      next();
   }
   catch(err){
      return res.status(500).json({
         success:false,
         message:"internal Server Error",
         error:err.message
      })
   }
 }

 exports.isVendor=async(req,res,next)=>{
   try{
      const role=req.user.role;
      if(role!=="canteen"){
         return res.status(401).json({
            success:false,
            message:"this is protect Route for Vendors"
         })
      }
      next();
   }
   catch(err){
      return res.status(500).json({
         success:false,
         message:"internal Server Error",
         error:err.message
      })
   }
 }

 exports.isAdmin=async(req,res,next)=>{
   try{
      const role=req.user.role;
      if(role!=="admin"){
         return res.status(401).json({
            success:false,
            message:"this is protected Route for Admin"
         })
      }
      next();
   }
   catch(err){
      return res.status(500).json({
         success:false,
         message:"Inernal server error",
         error:err.message
      })
   }
 }

exports.isAdminEnv = (req, res, next) => {
  try {
    const token = req.cookies.admin_token || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ success: false, message: "Not logged in as admin" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Forbidden: Not admin" });
    }
    req.admin = { username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired admin token" });
  }
};