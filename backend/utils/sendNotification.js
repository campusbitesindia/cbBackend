const{webPush}=require("../config/webPush")
const Notification=require("../models/Notification");
const PushSubscription = require("../models/PushSubscription");
const SendNotification=async(user,title,message,type)=>{
    try{


        let subscription=await PushSubscription.findOne({user:user._id});
        if(!subscription){
            return;
        }

        subscription=JSON.parse(subscription)
        const payload=JSON.stringify({
            title,
            body:message
        })
        const notification=await Notification.create({user:user._id,message,type:type?type:"order"});
        const sentMessage=await webPush.sendNotification(subscription.subscription,payload);
       
    }
    catch(err){
        console.log("error at SendNotification ",err.message);
    }
}

module.exports=SendNotification;