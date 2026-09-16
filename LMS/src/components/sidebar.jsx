import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { gsap } from "gsap";

export const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const sidebarRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".sidebar-card", 
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
      );

      gsap.fromTo(".sidebar-link",
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.04, ease: "power2.out", delay: 0.08 }
      );
    }, sidebarRef);

    return () => ctx.revert();
  }, []);

  const navItems = [
    { path: "/dashboard", label: "Dashboard & Stats", icon: "bi-grid-1x2", badge: null },
    { path: "/equipment", label: "Add Equipment", icon: "bi-plus-circle", badge: "Admin" },
    { path: "/lab", label: "Setup New Lab", icon: "bi-building-gear", badge: "Admin" },
    { path: "/allocate", label: "Issue & Allocate", icon: "bi-box-arrow-up-right", badge: "Stock" },
    { path: "/return", label: "Record Return", icon: "bi-arrow-return-left", badge: "Log" },
  ];

  return (
    <aside className="lms-sidebar" ref={sidebarRef}>
      <div className="sidebar-card">
        <div className="sidebar-header d-flex justify-content-between align-items-center mb-3 pb-1">
          <div>
            <span className="section-kicker mb-0">WORKSPACE</span>
            <h2 className="sidebar-title mb-0">Navigation</h2>
          </div>
          <span className="badge sidebar-pro-badge">
            <i className="bi bi-stars me-1"></i>PRO
          </span>
        </div>

        <ul className="sidebar-menu-list list-unstyled d-flex flex-column gap-1.5 mb-4">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <li className="sidebar-menu-item" key={item.path}>
                <Link 
                  className={`sidebar-link ${isActive ? "active" : ""}`} 
                  to={item.path}
                >
                  <div className="d-flex align-items-center gap-2.5">
                    <span className="sidebar-icon-wrap">
                      <i className={`bi ${item.icon}`}></i>
                    </span>
                    <span className="sidebar-link-text">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`sidebar-item-badge ${isActive ? "active" : ""}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* SYSTEM HEALTH STATUS BADGE */}
        <div className="sidebar-footer pt-2">
          <div className="system-health-card p-2.5 rounded-3 d-flex align-items-center gap-2.5">
            <span className="pulse-dot"></span>
            <div className="small flex-grow-1">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold system-status-text">Server Active</span>
                <span className="badge bg-success-subtle text-success system-latency-badge">&lt;12ms</span>
              </div>
              <span className="text-muted small system-subtext">MongoDB Realtime Sync</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
