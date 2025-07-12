import { useEffect, useState } from "react";
import { fetchUserNotifications } from "@/lib/api";

const NotificationList = ({ userId }: { userId: string }) => {
  type NotificationData = {
  _id: string;
  message: string;
  type: string;
  createdAt: string;
};

const [notifs, setNotifs] = useState<NotificationData[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchUserNotifications(userId);
        setNotifs(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [userId]);

  return (
    <div className="bg-white border p-3 rounded shadow">
      <h2 className="text-lg font-bold mb-2">Your Notifications</h2>
      <ul className="space-y-2">
        {notifs.map((n) => (
          <li key={n._id} className="border-b pb-2">
            <div className="font-medium">{n.message}</div>
            <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationList;