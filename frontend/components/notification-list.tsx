import { useEffect, useState, useRef } from 'react';
import { fetchUserNotifications } from '@/lib/api';
import { Bell, Clock, CheckCircle, AlertCircle } from 'lucide-react';

type NotificationListProps = {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
};

type NotificationData = {
  _id: string;
  message: string;
  createdAt: string;
};

const NotificationList: React.FC<NotificationListProps> = ({
  userId,
  isOpen,
  onClose,
}) => {
  const [notifs, setNotifs] = useState<NotificationData[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

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
        console.error('Failed to fetch notifications:', err);
      }
    };

    if (userId) load();
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={notificationRef}
      className='bg-white border border-gray-200 rounded-lg shadow-lg absolute right-4 top-12 w-80 max-h-96 overflow-hidden z-50'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Bell className='w-5 h-5' />
          <h2 className='text-lg font-semibold'>Notifications</h2>
        </div>
        {notifs.length > 0 && (
          <span className='bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full'>
            {notifs.length}
          </span>
        )}
      </div>

      {/* Notifications List */}
      <div className='max-h-80 overflow-y-auto scrollbar-hide'>
        {notifs.length !== 0 ? (
          <ul className='divide-y divide-gray-100'>
            {notifs.map((n) => (
              <li
                key={n._id}
                className='px-4 py-3 hover:bg-gray-50 transition-colors duration-150'>
                <div className='flex items-start gap-3'>
                  <div className='flex-shrink-0 mt-1'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm text-gray-900 leading-relaxed'>
                      {n.message}
                    </p>
                    <div className='flex items-center gap-1 mt-2 text-xs text-gray-500'>
                      <Clock className='w-3 h-3' />
                      <span>{formatTimeAgo(n.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className='px-4 py-8 text-center'>
            <div className='w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center'>
              <Bell className='w-8 h-8 text-gray-400' />
            </div>
            <p className='text-gray-500 text-sm font-medium'>
              No notifications yet
            </p>
            <p className='text-gray-400 text-xs mt-1'>
              We'll notify you when something happens
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifs.length > 0 && (
        <div className='border-t border-gray-100 px-4 py-2 bg-gray-50'>
          <button className='text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150'>
            Mark all as read
          </button>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none; /* Internet Explorer 10+ */
          scrollbar-width: none; /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
      `}</style>
    </div>
  );
};

export default NotificationList;
