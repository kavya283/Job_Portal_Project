import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import api from "../api/axios";

// Create context
export const NotificationContext = createContext();

// Initialize socket (one instance for app)
const socket = io("http://localhost:5000");

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Play sound for new notifications
  const playSound = () => {
    const audio = new Audio("/sounds/notification.mp3");
    audio.volume = 0.6;
    audio.play().catch(() => console.log("🔇 Sound blocked until user interaction"));
  };

  // Show toast popup
  const showToast = (message) => {
    const containerId = "toast-container";
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      container.style.position = "fixed";
      container.style.top = "20px";
      container.style.right = "20px";
      container.style.zIndex = "9999";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.innerText = message;
    toast.className = "toast-popup";
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 4000);
  };

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  }, []);

  // Socket listener + initial fetch
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?._id) return;

    // Initial fetch
    fetchNotifications();

    // Join socket room
    socket.emit("join", user._id);

    // Listen for incoming notifications
    const handleNotification = (notification) => {
      setNotifications(prev => {
        const updated = [notification, ...prev];
        setUnreadCount(updated.filter(n => !n.isRead).length);
        return updated;
      });

      // Toast & sound
      if (["NEW_JOB", "APPLICATION_RECEIVED", "APPLICATION_SUBMITTED"].includes(notification.type)) {
        const emoji = notification.type === "NEW_JOB" ? "🆕" : "📩";
        showToast(`${emoji} ${notification.message}`);
        playSound();
      }
    };

    socket.on("receive_notification", handleNotification);

    return () => socket.off("receive_notification", handleNotification);
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        unreadCount,
        setUnreadCount,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notifications
export const useNotifications = () => useContext(NotificationContext);
