import { useContext, useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Context } from "./context";
import { gsap } from "gsap";
import { API_BASE_URL } from "../config";
import { useToast } from "./ToastContext";

export const Header = () => {
  const [data, setdata] = useState([]);
  const { usertype, setusertype, theme, toggleTheme, openCmdPalette } = useContext(Context);
  const { info } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Gentle spin & scale on the cpu logo icon
      gsap.fromTo(".navbar-brand i",
        { rotate: -180, scale: 0.5, opacity: 0 },
        { rotate: 0, scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
      );

      // Stagger nav links in from the right
      gsap.fromTo(".navbar-nav > li",
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.05, ease: "power2.out", delay: 0.1 }
      );
    }, headerRef);

    return () => ctx.revert();
  }, []);

  const show = async () => {
    try {
      const result = await fetch(`${API_BASE_URL}/api/getlab`, {
        method: "get",
      });
      if (result) {
        const res = await result.json();
        if (res.statuscode === 1) {
          setdata(res.data);
        } else {
          setdata([]);
        }
      }
    } catch (err) {
      console.error("Error loading labs for header menu:", err);
      setdata([]);
    }
  };

  useEffect(() => {
    show();
  }, []);

  const logout = () => {
    localStorage.clear();
    setusertype("Guest");
    info("You have been signed out.");
    navigate("/");
  };

  const currentRole = localStorage.getItem("Utype") || usertype;
  const isLoggedIn = currentRole === "Admin" || currentRole === "User";

  return (
    <>
      <nav className="navbar navbar-expand-lg sticky-top" ref={headerRef}>
        <div className="container-fluid header-shell px-md-4">
          <div className="d-flex align-items-center gap-3">
            <button
              className="navbar-toggler border-0 shadow-none d-lg-none"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <Link to={isLoggedIn ? "/dashboard" : "/"} className="navbar-brand text-decoration-none">
              <i className="bi bi-cpu-fill"></i>
              <span>LabFlow</span>
            </Link>

            {/* Quick Command Bar Trigger */}
            <button
              type="button"
              className="btn cmd-trigger-btn d-none d-md-flex align-items-center gap-2"
              onClick={openCmdPalette}
              title="Quick Search & Actions (⌘K)"
            >
              <i className="bi bi-search text-muted small"></i>
              <span className="cmd-trigger-text text-muted">Search or jump to...</span>
              <span className="cmd-trigger-kbd">⌘K</span>
            </button>
          </div>

          <div
            className="collapse navbar-collapse align-items-center"
            id="navbarSupportedContent"
          >
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 gap-lg-2 align-items-center">
              {isLoggedIn && (
                <li className="nav-item">
                  <Link to="/dashboard" className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}>
                    <i className="bi bi-grid-1x2"></i>
                    <span>Dashboard</span>
                  </Link>
                </li>
              )}
              
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="bi bi-collection"></i>
                  <span>Lab Dashboards</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                  {data.map((a) => (
                    <li key={a._id || a.LabName}>
                      <Link className="dropdown-item" to={`/labdash?id=${a._id}`}>
                        <i className="bi bi-chevron-right me-1 small opacity-75"></i> {a.LabName}
                      </Link>
                    </li>
                  ))}
                  {data.length === 0 && (
                    <li>
                      <span className="dropdown-item-text text-muted small">No labs available</span>
                    </li>
                  )}
                </ul>
              </li>

              {currentRole === "Admin" && (
                <>
                  <li className="nav-item">
                    <Link className={`nav-link ${location.pathname === "/allocate" ? "active" : ""}`} to="/allocate">
                      <i className="bi bi-box-arrow-up"></i>
                      <span>Issue</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link ${location.pathname === "/equipment" ? "active" : ""}`} to="/equipment">
                      <i className="bi bi-plus-circle"></i>
                      <span>Add Equipment</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link ${location.pathname === "/lab" ? "active" : ""}`} to="/lab">
                      <i className="bi bi-building-add"></i>
                      <span>Add Lab</span>
                    </Link>
                  </li>
                </>
              )}

              {isLoggedIn && (
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === "/return" ? "active" : ""}`} to="/return">
                    <i className="bi bi-arrow-return-left"></i>
                    <span>Return</span>
                  </Link>
                </li>
              )}

              {/* Theme Toggle Button */}
              <li className="nav-item ms-lg-1">
                <button
                  className="btn btn-theme-toggle d-flex align-items-center gap-1.5"
                  onClick={toggleTheme}
                  title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
                  type="button"
                >
                  <i className={`bi ${theme === "light" ? "bi-moon-stars-fill text-primary" : "bi-sun-fill text-warning"}`}></i>
                  <span className="small d-none d-xl-inline">{theme === "light" ? "Dark" : "Light"}</span>
                </button>
              </li>

              {isLoggedIn ? (
                <>
                  <li className="nav-item ms-lg-1">
                    <span className={`badge role-pill ${currentRole === "Admin" ? "role-admin" : "role-user"}`}>
                      <i className={`bi ${currentRole === "Admin" ? "bi-shield-check" : "bi-person-check"} me-1`}></i>
                      {currentRole}
                    </span>
                  </li>
                  <li className="nav-item ms-lg-1">
                    <button className="btn logbtn d-flex align-items-center gap-2" type="button" onClick={logout}>
                      <i className="bi bi-box-arrow-right"></i>
                      <span>Logout</span>
                    </button>
                  </li>
                </>
              ) : (
                <li className="nav-item ms-lg-2">
                  <Link className="btn btn-primary btn-sm d-flex align-items-center gap-1 px-3 py-1.5" to="/">
                    <i className="bi bi-box-arrow-in-right"></i>
                    <span>Sign In</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};
