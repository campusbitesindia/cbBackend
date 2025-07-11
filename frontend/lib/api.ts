export async function fetchUserNotifications(userId: string) {
  const res = await fetch(`/api/notifications/user/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}