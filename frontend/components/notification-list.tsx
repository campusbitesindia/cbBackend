import { useEffect, useState } from "react";
import { fetchUserNotifications } from "@/lib/api";

type NotificationListProps = {
  userId: string;
};

type NotificationData = {
  _id: string;
  message: string;
  createdAt: string;
};

const NotificationList: React.FC<NotificationListProps> = ({ userId }) => {
  const [notifs, setNotifs] = useState<NotificationData[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchUserNotifications(userId);

        // Optional: map or filter if API sends extra data
        const filtered = res.map((n: any) => ({
          _id: n._id,
          message: n.message,
          createdAt: n.createdAt,
        }));

        setNotifs(filtered);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    if (userId) load();
  }, [userId]);

  return (
    <div className="bg-white border p-3 rounded shadow absolute right-[1rem] w-fit  h-[15rem] overflow-y-scroll">
      <h2 className="text-lg font-bold mb-2 text-black">Your Notifications</h2>
      <ul className="space-y-2">
        {notifs.map((n) => (
          <li key={n._id} className="border-b pb-2">
            <div className="font-medium text-black">{n.message}</div>
            <div className="text-xs text-gray-500">
              {new Date(n.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationList;
