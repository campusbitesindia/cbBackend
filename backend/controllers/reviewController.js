const Reviews = require('../models/Review')
const Canteen=require("../models/Canteen");
const User=require("../models/User");
const Item=require("../models/Item");
// GET reviews for a canteen
exports.getReviews = async (req, res) => {
    try {
        const {canteenId}=req.params;
        if(!canteenId){
            return res.status(400).json({
                success:false,
                message:"canteen Id not found"
            })
        }

        const canteen=await Canteen.findById(canteenId);
        if(!canteen){
            return res.status(400).json({
                success:false,
                message:"Canteen not found"
            })
        }

        const reviews=await Reviews.find({canteen:canteen._id}).populate({path:"student",select:"name"}).populate({path:"canteen",select:"name"}).populate({path:"item"});
        if(!reviews){
            return res.status(400).json({
                success:false,
                message:"no reviews found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"All Reviews Fetched SuccessFully",
            data:reviews
        })
        
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
// works

// POST review
exports.createReview = async (req, res) => {
    try {
        const {canteenId,itemId,rating,comment}=req.body;
        const userId=req.user._id;
        if(!canteenId || !itemId || !rating || !comment){
            return res.status(400).json({
                success:false,
                message:"Please Provide required Fields"
            })
        }

        if(!userId){
            return res.status(400).json({
                success:false,
                message:"User Id not found"
            })
        }

        const user=await User.findById(userId);
        if(!user){
            return res.status(400).json({
                success:false,
                message:"User not Found"
            })

        }

        const canteen=await Canteen.findById(canteenId);
        if(!canteen){
            return res.status(400).json({
                success:false,
                message:"Canteen not found"
            })
        }

        const item=await Item.findById(itemId)
        if(!item){
            return res.status(400).json({
                success:false,
                message:"Item not found"
            })
        }

        const newReview=(await Reviews.create({student:user._id,canteen:canteen._id,item:item._id,rating,comment}));

        return res.status(200).json({
            success:true,
            message:"review Created SuccessFully",
            data:newReview
        })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}
// works

exports.getAllReviewForItem=async(req,res)=>{
    try{
        const {id:itemId}=req.params;
        if( !itemId){
            return res.status(400).json({
                success:false,
                message:"please Provide Required Fields"
            })
        }

        const item= await Item.findById(itemId);
        if(!item){
            return res.status(400).json({
                success:false,
                message:"item not found"
            })
        }

        const review=await Reviews.find({item:item._id}).populate({path:"student",select:"name"}).populate({path:"canteen",select:"name"}).populate({path:"item"});;
        if(!review){
            return res.status(400).json({
                success:false,
                message:"review not found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"item Reviews Fetched SuccessFully",
            data:review
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"internal server error",
            error:err.message
        })
    }
}


exports.getCanteenAverageRating=async(req,res)=>{
    try{
        const{id:canteenId}=req.params;

        if(!canteenId){
            return res.status(400).json({
                success:false,
                message:"canteenId not found"
            })
        }
        const canteen=await Canteen.findById(canteenId);
        if(!canteen){
            return res.status(400).json({
                success:false,
                message:"canteen not found"
            })
        }

        const AverageReview=await Reviews.aggregate([{$match:{canteen:canteen._id}},
         {
               $group:{
            _id:null,
            averageRating:{$avg:"$rating"}
            }
         }
        ]);

        return res.status(200).json({
            success:true,
            message:"average Rating fetched SuccessFully",
            data:{
                canteen,
                AverageRating:AverageReview[0].averageRating
            }
        })

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"internal server error",
            error:err.message
        })
    }
}

exports.getItemAverageRating=async(req,res)=>{

    try{
        const {id:itemId}=req.params;

        
        if(!itemId){
            return res.status(400).json({
                success:false,
                message:"itemId not found"
            })
        }

        const item=await Item.findById(itemId);

        if(!item){
            return res.status(400).json({
                success:false,
                message:"item not found"
            })
        }

        const ItemAverageRating=await Reviews.aggregate([
            {
                $match:{item:item._id}
            },
            {
                $group:{
                    _id:null,
                    AverageItemRating:{$avg:"$rating"}
                }
            }
        ])

        return res.status(200).json({
            success:false,
            message:"average rating of Item fetched",
            data:{
                item,
                AverageRating:ItemAverageRating[0].AverageItemRating
            }
        })
        
    }

    catch(err){
        return res.status(500).json({
            success:false,
            message:"internal server error",
            error:err.message
        })
    }
}