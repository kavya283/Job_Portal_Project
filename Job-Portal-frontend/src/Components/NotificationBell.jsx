import { FaBell } from "react-icons/fa";
import { useNotifications } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import "../styles/NotificationBell";

const NotificationBell = () => {
  const { notifications, user } = useNotifications();
  const navigate = useNavigate();

  const unread = notifications.filter(n => !n.isRead).length;

  const path =
    user?.role === "employer"
      ? "/employer/notifications"
      : "/candidate/notifications";

  return (
    <div className="notification-bell" onClick={() => navigate(path)}>
      <FaBell size={22} />
      {unread > 0 && <span className="notification-badge">{unread}</span>}
    </div>
  );
};

export default NotificationBell;
