import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiRequest from "../../../Services/apiRequest";

export default function NotificationBell() {
  const [expiringMembers, setExpiringMembers] = useState([]);

  useEffect(() => {
    // Real data fetch karne wala function call karein
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // ✅ Aapki existing usermembership API call
      const res = await apiRequest.get("usermembership/");
      
      if (res.status === "success" && res.result) {
        const allMemberships = res.result;
        
        // Aaj ki date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Aaj se 7 din baad ki date
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        nextWeek.setHours(23, 59, 59, 999);

        // ✅ Filter: Sirf wo active members nikalein jo aaj se leke aane wale 7 dino mein expire honge
        const expiringSoon = allMemberships.filter((m) => {
          if (m.status !== "active") return false; // Inactive/Completed ko ignore karein
          
          const endDate = new Date(m.end_at);
          return endDate >= today && endDate <= nextWeek;
        });

        // State update karein real data ke sath
        setExpiringMembers(expiringSoon);
      }
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  };

  return (
    <div className="dropdown d-none d-md-flex">
      {/* Bell Icon Button */}
      <div 
        className="notification-icon d-flex align-items-center justify-content-center" 
        data-bs-toggle="dropdown"
        aria-expanded="false"
        style={{ cursor: "pointer", position: "relative" }}
      >
        <i className="bi bi-bell"></i>
        {/* Red Dot & Count */}
        {expiringMembers.length > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white" style={{ fontSize: "10px", padding: "3px 5px", marginTop: "10px", marginLeft: "-10px" }}>
            {expiringMembers.length}
          </span>
        )}
      </div>

      {/* Dropdown List */}
      <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-3 p-0" style={{ width: "320px", maxHeight: "400px", overflowY: "auto", borderRadius: "10px" }}>
        
        {/* Header */}
        <li className="p-3 border-bottom bg-light sticky-top d-flex justify-content-between align-items-center" style={{ zIndex: 10 }}>
          <h6 className="mb-0 fw-bold text-dark">Notifications</h6>
          <span className="badge bg-danger-subtle text-danger rounded-pill">
            {expiringMembers.length} Expiring
          </span>
        </li>

        {/* List Items */}
        {expiringMembers.length > 0 ? (
          expiringMembers.map((m, index) => (
            <li key={index}>
              <div className="dropdown-item py-3 border-bottom text-wrap">
                <div className="d-flex align-items-start">
                  <div className="bg-warning-subtle text-warning rounded-circle d-flex align-items-center justify-content-center me-3 mt-1" style={{ width: "35px", height: "35px" }}>
                    <i className="bi bi-clock-history fs-6"></i>
                  </div>
                  <div className="flex-grow-1">
                    {/* ✅ Real Database Fields map kiye hain */}
                    <h6 className="mb-1 fw-bold text-dark fs-6">{m.member?.name || "Unknown"}</h6>
                    <p className="mb-1 text-muted small lh-sm">
                      Plan: {m.membershipPackage?.name || "N/A"} <br/>
                      Phone: {m.member?.mobile || "N/A"}
                    </p>
                    <small className="text-danger fw-bold d-block mt-1">
                      <i className="bi bi-calendar-x me-1"></i> Due: {m.end_at?.substring(0, 10)}
                    </small>
                  </div>
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="p-4 text-center text-muted">
            <i className="bi bi-bell-slash fs-2 mb-2 opacity-50"></i>
            <p className="mb-0 fw-medium small">All caught up!</p>
          </li>
        )}

        {/* Footer Link */}
        <li className="p-2 text-center bg-light position-sticky bottom-0 border-top" style={{ zIndex: 10 }}>
          <Link to="/admin/user-membership" className="text-decoration-none fw-bold text-primary small">
            View All Memberships
          </Link>
        </li>
      </ul>
    </div>
  );
}