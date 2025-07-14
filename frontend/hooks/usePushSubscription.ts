"use client";

import { useEffect } from "react";

interface SubscriptionRequestBody {
  userId: string;
  subscription: PushSubscriptionJSON;
}
export const usePushSubscription = (userId?:string) => {
  useEffect(() => {
    if(!userId) return;
    const subscribeUser = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      
      const registration = await navigator.serviceWorker.register("/sw.js");
      let subscription = await registration.pushManager.getSubscription();
    
      if (!subscription) {
        const res = await fetch("");
        const { publicKey } = await res.json();
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey
        });
      }

      const body: SubscriptionRequestBody = {
        userId,
        subscription: subscription.toJSON(),
      };

      await fetch("", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    };

    subscribeUser();
  }, [userId]);
};
