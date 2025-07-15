const{webPush}=require("../config/webPush")
const Notification=require("../models/Notification");
const SendNotification=async(user,title,message,type)=>{
    try{
        let subscription=user?.subscription;
        if(!subscription){
            return;
        }

        subscription=JSON.parse(subscription)
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