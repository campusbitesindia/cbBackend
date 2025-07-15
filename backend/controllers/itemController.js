const Item = require('../models/Item')
const Canteen=require("../models/Canteen");
const cloudinary=require("cloudinary").v2;
// GET all items for canteen
exports.getItems = async (req, res) => {
    try {
       const {id:canteenId}=req.params;
       console.log(canteenId);
       if(!canteenId){
        return res.status(400).json({
            success:false,
            message:"CanteenId not found"
        })
       }
       const canteen=await Canteen.findById(canteenId);
       if(!canteen){
        return res.status(400).json({
            success:false,
            message:"caneen not found"
        })
       }
       const Items=await Item.find({canteen:canteen._id});
       return res.status(200).json({
        success:true,
        message:"Items Fetched SuccessFully",
        data:Items
       })

        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// works

// POST create item
exports.createItem = async (req, res) => {
    try {
        const {name,price}=req.body;
        const canteenId=req.user.canteenId;
        const Image=req.file;
        console.log(name,price,req.file)
    
        if(!name || !price || !canteenId || !Image){
            return res.status(400).json({
                success:false,
                message:"name ,price,Image or canteenId is missing"
            })
        }

        const canteen=await Canteen.findById(canteenId);
        console.log(canteen)
        if(!canteen){
            return res.status(400).json({
                success:false,
                message:"canteen not found"
            })

        }
        const uploaded=await cloudinary.uploader.upload(Image.path,{resource_type:'auto',folder:process.env.ItemsFolder})
        console.log(uploaded)
        const item=Item.create({name,price,canteen:canteen._id,image:uploaded.secure_url});
        return res.status(200).json({
            success:true,
            message:"Item created SuccessFully",
            data:item
        })
    } catch (err) {
        res.status(500).json({
            success:false,
            message:"internal server error",
            error: err.message })
    }
};
// works

// PUT update item
exports.updateItem = async (req, res) => {
    try {
        const data=req.body;
       
        const{id:itemId}=req.params;
        const file=req.file;
        const item=await Item.findById(itemId);
        if(!item){
            return res.status(400).json({
                success:false,
                message:"Item not found"
            })
        }

        for(const key in data){
            if(item[key]!=data[key]){
                item[key]=data[key];
            }

        }
        if(file){
            const uploadedImage=await cloudinary.uploader.upload(file.path,{resource_type:"auto",folder:process.env.ItemsFolder})
            item.image=uploadedImage.secure_url;
        }
        await item.save();
        return res.status(200).json({
            success:false,
            message:"item Updated SuccessFully",
            data:item
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
// works

// DELETE item
exports.deleteItem = async (req, res) => {
    try {
        const {id:ItemId}=req.params;
        if(!ItemId){
            return res.status(400).json({
                success:false,
                messaeg:"ItemId not Found"
            })
        }

        const item=await Item.findByIdAndUpdate(ItemId,{isDeleted:true},{new:true});
        return res.status(200).json({
            success:true,
            messaege:"Item deleted SuccessFully",
            data:{}
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
// works