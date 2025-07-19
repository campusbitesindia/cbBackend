const Order=require("../models/Order");
const User =require("../models/User");
const Transaction=require("../models/Transaction");
const Penalty=require("../models/penaltySchema");
const  SendNotification  = require("../utils/sendNotification");

exports.CreateCODTransaction=async(req,res)=>{
    try{
        const {orderId}=req.body;

        if(!orderId){
            return res.status(400).json({
                success:false,
                message:"Please provide all necessary fields"
            })
        }
        const order=await Order.findById(orderId).populate("student");
        const ExistingTransaction=await Transaction.findOne({orderId:order._id});
        if(ExistingTransaction){
            return res.status(400).json({
                success:false,
                message:"Transaction made for this Order Id please Create a new order"
            })
        }
        if(!order){
            return res.status(400).json({
                success:false,
                message:"order with this Id not found"
            })
        }
        const UpdatedOrder=await Order.findByIdAndUpdate(orderId,{paymentStatus:"COD",status:"placed"},{new:true});
        const transaction=await Transaction.create({orderId:order._id,userId:order.student,amount:order.total,paymentMethod:"COD",currency:"INR"})
        
       
        await SendNotification(order.student._id,"Order Placed","Your Order has been Placed")
        return res.status(200).json({
            success:true,
            message:"Transaction Made SuccessFully",
            data:{transaction,order:UpdatedOrder}
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"internal Sever error",
            error:err.message
        })
    }
}