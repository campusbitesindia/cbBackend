const mongoose=require("mongoose");


const penaltySchema=new mongoose.Schema({
    deviceId:{
        type:String,
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    Order:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order",
        required:true
    },
    canteen:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Canteen",
        required:true
    },
    Amount:{
        type:Number,
        required:true
    },
    reason:{
        type:String,
        required:true
    },
    isPaid:{
        type:Boolean,
        required:true
    }

},{timestamps:true});

module.exports=mongoose.model("Penalty",penaltySchema)