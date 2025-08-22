const{webPush}=require("../config/webPush")
const Notification=require("../models/Notification");
const User=require("../models/User")
const SendNotification=async(userId,title,message,type)=>{
    try{
        
        const user=await User.findOne({_id:userId});
        console.log(user)
        if(!user){
            return;
        }

        const subscription=JSON.parse(user.subscription);
        console.log(subscription)
        const payload=JSON.stringify({
            title,
            body:message
        })
        const notification=await Notification.create({user:user._id,message,type:type?type:"order"});
        const sentMessage=await webPush.sendNotification(subscription,payload);
       
    }
    catch(err){
        console.log("error at SendNotification ",err.message);
    }
}

module.exports=SendNotification;