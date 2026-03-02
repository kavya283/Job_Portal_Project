import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import api from "../api/axios";
import "../styles/Navbar.css";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [scrolled, setScrolled] = useState(false);
  const [pulse, setPulse] = useState(false);

  const {
    notifications,
    unreadCount,
    setNotifications,
    setUnreadCount,
    fetchNotifications   // ✅ ADDED
  } = useNotifications();

  const role = localStorage.getItem("role") || "candidate";
  const navigate = useNavigate();

  /* 🌗 Theme */
  useEffect(() => {
    document.body.classList.toggle("dark", isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  /* 📌 Navbar shadow */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* 🔔 FETCH NOTIFICATIONS ON NAVBAR LOAD */
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /* 🔢 AUTO SYNC UNREAD COUNT */
  useEffect(() => {
    const unread = notifications.filter(n => !n.isRead).length;
    setUnreadCount(unread);
  }, [notifications, setUnreadCount]);

  /* 🔔 Pulse animation */
  useEffect(() => {
    if (unreadCount > 0) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 700);
      return () => clearTimeout(t);
    }
  }, [unreadCount]);

  /* 🔒 Lock scroll */
  useEffect(() => {
    document.body.style.overflow =
      showNotifPanel || showDropdown ? "hidden" : "auto";
  }, [showNotifPanel, showDropdown]);

  /* ❌ ESC closes drawers */
  useEffect(() => {
    const esc = (e) => {
      if (e.key === "Escape") {
        setShowNotifPanel(false);
        setShowDropdown(false);
      }
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const toggleTheme = () => setIsDarkMode((p) => !p);

  /* 🔔 OPEN NOTIFICATION PANEL + REFRESH */
  const openNotif = () => {
    fetchNotifications();     // ✅ ensure fresh notifications
    setShowNotifPanel(true);
    setShowDropdown(false);
  };

  const openProfile = () => {
    setShowDropdown(true);
    setShowNotifPanel(false);
  };

  const handleNotifClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await api.put(`/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notif._id ? { ...n, isRead: true } : n
          )
        );
      }

      setShowNotifPanel(false);

      navigate(
        role === "employer"
          ? "/employer/notifications"
          : "/candidate/notifications"
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <nav className={`global-navbar ${scrolled ? "navbar-scrolled" : ""}`}>
        <div className="nav-container">
          <div
            className="nav-logo"
            onClick={() =>
              navigate(role === "employer" ? "/employer/home" : "/candidate/home")
            }
          >
            JobPortal
          </div>

          <div className="nav-actions">
            <button
              className={`notif-bell ${pulse ? "pulse" : ""}`}
              onClick={openNotif}
            >
              🔔
              {unreadCount > 0 && (
                <span className="nav-badge">{unreadCount}</span>
              )}
            </button>

            <button className="profile-trigger" onClick={openProfile}>
              👤
            </button>
          </div>
        </div>
      </nav>

      {(showDropdown || showNotifPanel) && (
        <div
          className="notif-overlay"
          onClick={() => {
            setShowDropdown(false);
            setShowNotifPanel(false);
          }}
        />
      )}

      {/* PROFILE DRAWER */}
      {showDropdown && (
        <div className="profile-dropdown full-page">
          {role === "candidate" ? (
            <>
              <Link onClick={()=>setShowDropdown(false)} to="/candidate/home" className="dropdown-item">Dashboard</Link>
              <Link onClick={()=>setShowDropdown(false)} to="/candidate/profile" className="dropdown-item">Profile</Link>
              <Link onClick={()=>setShowDropdown(false)} to="/my-applications" className="dropdown-item">Applications</Link>
              <Link onClick={()=>setShowDropdown(false)} to="/candidate/jobs" className="dropdown-item">Find Jobs</Link>
            </>
          ) : (
            <>
              <Link onClick={()=>setShowDropdown(false)} to="/employer/home" className="dropdown-item">Dashboard</Link>
              <Link onClick={()=>setShowDropdown(false)} to="/employer/profile" className="dropdown-item">Profile</Link>
              <Link onClick={()=>setShowDropdown(false)} to="/employer/my-jobs" className="dropdown-item">My Jobs</Link>
              <Link onClick={()=>setShowDropdown(false)} to="/employer/post-job" className="dropdown-item">Post a Job</Link>
            </>
          )}

          <div className="dropdown-divider"></div>

          <div className="dropdown-item" onClick={toggleTheme}>
            {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </div>

          <div className="dropdown-divider"></div>

          <button onClick={handleLogout} className="dropdown-item logout">
            Logout
          </button>
        </div>
      )}

      {/* NOTIFICATION PANEL */}
      {showNotifPanel && (
        <div className="notif-panel">
          <div className="notif-header">
            Notifications
            <button onClick={() => setShowNotifPanel(false)}>✕</button>
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <p className="empty">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`notif-item ${!n.isRead ? "unread" : ""}`}
                  onClick={() => handleNotifClick(n)}
                >
                  <p>{n.message}</p>
                  <span className="time">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
