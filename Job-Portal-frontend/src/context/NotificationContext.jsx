import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import api from "../api/axios";

export const NotificationContext = createContext();

const socket = io("http://localhost:5000");

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  /* ================= SOUND ================= */
  const playSound = () => {
    const audio = new Audio("/sounds/notification.mp3");
    audio.volume = 0.6;
    audio.play().catch(() => {});
  };

  /* ================= TOAST ================= */
  const showToast = (message) => {
    const containerId = "toast-container";
    let container = document.getElementById(containerId);

    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      Object.assign(container.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: "9999",
      });
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.innerText = message;
    toast.className = "toast-popup";
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 4000);
  };

  /* ================= FETCH ================= */
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await api.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ remove duplicates
      const unique = res.data.filter(
        (n, index, self) =>
          index === self.findIndex((t) => t._id === n._id)
      );

      setNotifications(unique);
      setUnreadCount(unique.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Fetch notifications error:", err.response?.data || err.message);
    }
  }, []);

  /* ================= MARK ONE ================= */
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  /* ================= MARK ALL ================= */
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.put("/notifications/read/all", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  /* ================= SOCKET ================= */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?._id) return;

    fetchNotifications();

    socket.emit("join", user._id);

    const handleNotification = (notification) => {
      setNotifications((prev) => {
        // ✅ prevent duplicates (real-time)
        if (prev.some((n) => n._id === notification._id)) return prev;

        const updated = [notification, ...prev];
        setUnreadCount(updated.filter((n) => !n.isRead).length);
        return updated;
      });

      showToast(notification.message);
      playSound();
    };

    socket.on("receive_notification", handleNotification);

    return () => socket.off("receive_notification", handleNotification);
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,       // ✅ added
        markAllAsRead,    // ✅ added
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
