"use client";

import axios from "axios";
import { useEffect } from "react";

interface SubscriptionRequestBody {
  userId: string;
  subscription: string;
}

export const usePushSubscription = (userId?: string) => {
  useEffect(() => {
    if (!userId) return;
   const subscribeUser = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
      
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        let subscription = await registration.pushManager.getSubscription();

       

      if(!subscription){
          const res = await axios.get("https://campusbites-mxpe.onrender.com/api/v1/notifications/publicKey");
        const { publicKey } = res.data;

        subscription= await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey,
        });
      }

        const response = await axios.post("https://campusbites-mxpe.onrender.com/api/v1/notifications/subscribe", {
          userId,
          subscription: JSON.stringify(subscription.toJSON()),
        });
       
        console.log("Push subscription saved.");
      } catch (err) {
        console.error("Push subscription error:", err);
      }
    };

    subscribeUser(); 
  }, [userId]);
};
