import axios from "axios";

export async function fetchUserNotifications(userId: string) {
  try{
    const response=await axios.get(`https://campusbites-mxpe.onrender.com/api/v1/notifications/user/${userId}`)
    if(!response.data.success){
      throw new Error(response.data.message);
    }
    
    return response.data.data
  }
  catch(err){
    console.log(err);
  }
}