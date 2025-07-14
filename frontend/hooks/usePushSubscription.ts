"use client";

import axios from "axios";
import { useEffect } from "react";
import { json } from "stream/consumers";

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

      const registration = await navigator.serviceWorker.register("/sw.js");

      const existingSubscription = await registration.pushManager.getSubscription();
      
      // if (existingSubscription) {
      //   console.log("User is already subscribed.");
      //   return; // Prevent unnecessary re-subscription
      // }

      try {
        const res = await axios.get("http://localhost:8080/api/v1/notifications/publicKey");
        const { publicKey } = res.data;

        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey,
        });
        const newData=JSON.stringify(newSubscription.toJSON())
       

        const response =await axios.post("http://localhost:8080/api/v1/notifications/saveSubscription", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data:{userId,subscription:newData},
        })
        console.log()
        console.log("Push subscription saved.");
      } catch (err) {
        console.error("Push subscription error:", err);
      }
    };

    subscribeUser();
  }, [userId]);
};
