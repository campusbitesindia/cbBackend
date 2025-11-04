const mongoose=require("mongoose");

const offerSchema=new mongoose.Schema({
    description:{
        type:String
    },
    MinValue:{
        type:Number,
        required:true
    },
    MaxValue:{
        type:Number,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    isUnique:{
        type:String,
        required:true
    },
    claimedUser:[{
        type:mongoose.Schema.Types.ObjectId
    }],
    MaxDiscount:{
        type:Number,
        required:true
    },
    isActive:{
        type:Boolean,
        required:true ,
        default:true
    }

})

module.exports=mongoose.model("Offer",offerSchema);