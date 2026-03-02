import { useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import "../styles/Notifications.css";

const EmpNotifications = () => {
  const { notifications, fetchNotifications } = useNotifications();

  // Fetch notifications once on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filter employer notifications
  const employerNotifications = notifications.filter(n => n.recipientRole === "employer");

  return (
    <div className="notif-page-container">
      <div className="notif-header">
        <h2>Application Notifications</h2>
      </div>

      {employerNotifications.length === 0 ? (
        <div className="empty-state">No notifications yet</div>
      ) : (
        <div className="notif-list">
          {employerNotifications.map(n => {
            const name = n.candidateName || n.sender?.name || "Candidate";
            const initials = name
              .split(" ")
              .filter(Boolean)
              .map(w => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div key={n._id} className={`notif-card ${n.isRead ? "" : "unread"}`}>
                <div className="notif-avatar">{initials}</div>

                <div className="notif-content">
                  <div className="notif-title-row">
                    <span className="notif-entity-name">{name}</span>
                    <span className="notif-role-label">
                      {n.companyName || n.job?.companyName || "Company"}
                    </span>
                  </div>

                  <p className="notif-message">
                    {n.message || `${name} applied for ${n.job?.title || "a job"}`}
                  </p>

                  <span className="notif-time">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>

                {!n.isRead && <span className="unread-dot" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmpNotifications;
