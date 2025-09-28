import { useEffect, useRef } from "react";
import io from "socket.io-client";

const API_BASE = import.meta.env.VITE_BACKEND_URL;
export default function useWebSocket(socketHandlersRef) {
  const socketRef = useRef(null);
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      socketRef.current = io(API_BASE, {
        auth: { token },
        path: "/socket.io",
      });

      socketRef.current.on("connect", () => {
        const userId = localStorage.getItem("userId");
        if (userId) socketRef.current.emit("join-user", userId);
        socketHandlersRef?.current?.onConnect?.();
      });

      socketRef.current.on("activity-added", (data) => {
        socketHandlersRef?.current?.onActivityAdded?.(data);
      });

      socketRef.current.on("goal-updated", (data) => {
        socketHandlersRef?.current?.onGoalUpdated?.(data);
      });

      socketRef.current.on("progress-updated", (data) => {
        socketHandlersRef?.current?.onProgressUpdated?.(data);
      });

      socketRef.current.on("disconnect", () => {
        console.log("WebSocket disconnected");
      });
    } catch (err) {
      console.error("WebSocket init error", err);
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [socketHandlersRef]);
}
