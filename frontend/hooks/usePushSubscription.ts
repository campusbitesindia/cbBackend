"use client";

import { useEffect } from "react";

interface SubscriptionRequestBody {
  userId: string;
  role: string;
  subscription: PushSubscriptionJSON;
}

export const usePushSubscription = (userId?: string, role?: string) => {
  useEffect(() => {
    if (!userId || !role) return;
    const subscribeUser = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      // Fetch VAPID public key from backend
      const res = await fetch("/api/v1/notifications/publicKey");
      const { publicKey } = await res.json();
      if (!publicKey) return;
      
      const registration = await navigator.serviceWorker.register("/sw.js");
      let subscription = await registration.pushManager.getSubscription();
    
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey,
        });
      }

      const body: SubscriptionRequestBody = {
        userId,
        role,
        subscription: subscription.toJSON(),
      };

      await fetch("/api/v1/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    };

    subscribeUser();
  }, [userId, role]);
};
