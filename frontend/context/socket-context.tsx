import { createContext, useContext, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

const SocketContext = createContext<Socket | null>(null)

export function SocketProvider({ children, userId, isVendor }: any) {
    const socketRef = useRef<Socket | null>(null)

    useEffect(() => {
        if (!userId) return;

        socketRef.current = io('http://localhost:8080')         //  change this in production

        const room = isVendor ? `vendor_${userId}` : `user_${userId}`;

        socketRef.current.emit('join_room', room)

        return () => {
            socketRef.current?.disconnect()
        }
    }, [userId])

    return (
        <SocketContext.Provider value={socketRef.current}>
            {children}
        </SocketContext.Provider>
    )
}

export const useSocket = () => useContext(SocketContext);
