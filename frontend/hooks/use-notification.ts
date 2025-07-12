import { useEffect } from "react";
import { toast } from "react-hot-toast";
// import { toast } from "sonner";
import { useSocket } from "@/context/socket-context";

export const useNotificationToast = () => {
    const socket = useSocket()

    useEffect(() => {
        if (!socket) return;

        socket.on("notification", (data) => {
            toast(`${data.message}`, {
                icon: "🔔",
                duration: 5000,
                position: "top-right",
            });

            // Play notification sound
            const audio = new Audio("/notif.mp3")
            audio.play()
        })

        return () => {
            socket.off("notification")
        }
    }, [socket])
}