import { useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import "../styles/Notifications.css";

const CandNotifications = () => {
  const { notifications, fetchNotifications } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]); // ✅ prevents React warning

  const candidateNotifications = notifications.filter(
    (n) => n.recipientRole === "candidate"
  );

  return (
    <div className="notif-page-container">
      <div className="notif-header">
        <h2>Notifications</h2>
      </div>

      {candidateNotifications.length === 0 ? (
        <div className="empty-state">No notifications yet</div>
      ) : (
        <div className="notif-list">
          {candidateNotifications.map((n) => {

            /* =========================
               COMPANY NAME SAFE FALLBACK
               ========================= */
            const company =
              n.companyName ||
              n.job?.companyName ||
              n.sender?.companyName ||
              "Company";

            /* =========================
               CANDIDATE NAME FALLBACK
               ========================= */
            const candidate =
              n.candidateName ||
              "You";

            /* =========================
               AVATAR INITIALS
               ========================= */
            const initials = company
              .split(" ")
              .filter(Boolean)
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={n._id}
                className={`notif-card ${n.isRead ? "" : "unread"}`}
              >
                {/* Avatar */}
                <div className="notif-avatar">{initials}</div>

                <div className="notif-content">
                  <div className="notif-title-row">
                    <span className="notif-entity-name">{company}</span>

                    <span className="notif-role-label">
                      {candidate}
                    </span>
                  </div>

                  {/* =========================
                     SMART MESSAGE FALLBACK
                     ========================= */}
                  <p className="notif-message">
                    {n.message ||
                      `Update from ${company}`}
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

export default CandNotifications;
