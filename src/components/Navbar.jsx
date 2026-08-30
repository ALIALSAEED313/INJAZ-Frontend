import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { getNotifications, markAsRead, markAllAsRead } from "../services/notificationService";

function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("unread"); // "unread" | "history"
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    async function fetchNotifs() {
      try {
        const data = await getNotifications();
        if (!isMounted) return;
        setUnreadNotifications(data.unread || []);
        setReadNotifications(data.read || []);
        setUnreadCount(data.totalUnread || 0);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    }

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleNotificationClick(notif) {
    if (!notif.isRead) {
      try {
        await markAsRead(notif._id);
        // Move from unread to read history
        setUnreadNotifications((prev) => prev.filter((item) => item._id !== notif._id));
        setReadNotifications((prev) => [{ ...notif, isRead: true }, ...prev]);
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    }

    setIsOpen(false);

    if (notif.order?._id || notif.order) {
      const orderId = notif.order?._id || notif.order;
      navigate(`/workspace/${orderId}`);
    } else {
      navigate("/dashboard");
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllAsRead();
      setReadNotifications((prev) => [
        ...unreadNotifications.map((n) => ({ ...n, isRead: true })),
        ...prev,
      ]);
      setUnreadNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  }

  return (
    <nav className="navbar" style={{ 
        position: "relative", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: "10px 20px" // Adds some breathing room around the edges
      }}>
      <Link to="/" className="navbar-brand" style={{ textDecoration: "none" }} >
      <div className="Injaz-brand">
        <img src="src/assets/INJAZ-LOGO-tran.svg" className="injaz-logo" alt="Injaz Logo" className="injaz-logo" style={{ height: "70px", width: "auto" }}/>
      </div>
      
      </Link>

      <div className="navbar-links" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <Link to="/">Home</Link>
        <Link to="/services">Services</Link>

        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            {user.isSeller && <Link to="/services/create">Create Service</Link>}

            {/* Notification Bell Dropdown */}
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.3rem",
                  position: "relative",
                  padding: "6px",
                  display: "flex",
                  alignItems: "center"
                }}
                aria-label="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      backgroundColor: "#ff4d4f",
                      color: "#fff",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      lineHeight: "1"
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {isOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "40px",
                    width: "340px",
                    backgroundColor: "#fff",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                    borderRadius: "8px",
                    zIndex: 1000,
                    overflow: "hidden",
                    border: "1px solid #e2e8f0"
                  }}
                >
                  <div
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #edf2f7",
                      display: "flex",
                      justify: "space-between",
                      alignItems: "center",
                      backgroundColor: "#f7fafc"
                    }}
                  >
                    <span style={{ fontWeight: "bold", fontSize: "14px" }}>Notifications</span>
                    {unreadNotifications.length > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#0070f3",
                          fontSize: "12px",
                          cursor: "pointer",
                          fontWeight: "500"
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Tabs: Unread vs History */}
                  <div style={{ display: "flex", borderBottom: "1px solid #edf2f7" }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab("unread")}
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "none",
                        borderBottom: activeTab === "unread" ? "2px solid #0070f3" : "none",
                        backgroundColor: activeTab === "unread" ? "#fff" : "#f7fafc",
                        fontWeight: activeTab === "unread" ? "bold" : "normal",
                        cursor: "pointer",
                        fontSize: "13px"
                      }}
                    >
                      Unread ({unreadNotifications.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("history")}
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "none",
                        borderBottom: activeTab === "history" ? "2px solid #0070f3" : "none",
                        backgroundColor: activeTab === "history" ? "#fff" : "#f7fafc",
                        fontWeight: activeTab === "history" ? "bold" : "normal",
                        cursor: "pointer",
                        fontSize: "13px"
                      }}
                    >
                      History ({readNotifications.length})
                    </button>
                  </div>

                  {/* Content List */}
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {activeTab === "unread" ? (
                      unreadNotifications.length === 0 ? (
                        <p style={{ padding: "16px", textAlign: "center", color: "#a0aec0", margin: 0, fontSize: "13px" }}>
                          No unread notifications
                        </p>
                      ) : (
                        unreadNotifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            style={{
                              padding: "12px 16px",
                              borderBottom: "1px solid #edf2f7",
                              cursor: "pointer",
                              backgroundColor: "#ebf8ff",
                              transition: "background 0.2s"
                            }}
                          >
                            <div style={{ fontWeight: "bold", fontSize: "13px", color: "#2b6cb0" }}>
                              {notif.title}
                            </div>
                            <div style={{ fontSize: "12px", color: "#4a5568", marginTop: "4px" }}>
                              {notif.message}
                            </div>
                            <div style={{ fontSize: "10px", color: "#a0aec0", marginTop: "4px" }}>
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      )
                    ) : (
                      readNotifications.length === 0 ? (
                        <p style={{ padding: "16px", textAlign: "center", color: "#a0aec0", margin: 0, fontSize: "13px" }}>
                          No notification history
                        </p>
                      ) : (
                        readNotifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            style={{
                              padding: "12px 16px",
                              borderBottom: "1px solid #edf2f7",
                              cursor: "pointer",
                              backgroundColor: "#fff"
                            }}
                          >
                            <div style={{ fontWeight: "500", fontSize: "13px", color: "#4a5568" }}>
                              {notif.title}
                            </div>
                            <div style={{ fontSize: "12px", color: "#718096", marginTop: "4px" }}>
                              {notif.message}
                            </div>
                            <div style={{ fontSize: "10px", color: "#a0aec0", marginTop: "4px" }}>
                              {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link to={`/profile/${user._id}`} className="profile-avatar-link">
              <img
                src={user?.avatarUrl}
                alt="Profile"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  display: 'block',
                  border: '2px solid #ccc'
                }}
              />
            </Link>
            <button onClick={logout} className="logout-btn">Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/sign-up">Sign Up</Link>
            <Link to="/sign-in">Sign In</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
