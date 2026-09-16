import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "./context";
import { gsap } from "gsap";
import { API_BASE_URL } from "../config";
import { useToast } from "./ToastContext";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setusertype } = useContext(Context);
  const { success, error, warning, info } = useToast();
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".auth-card",
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" }
      );

      gsap.fromTo(".form-panel > *",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", delay: 0.15 }
      );

      gsap.fromTo(".side-panel > *",
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", delay: 0.25 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const login = async (e) => {
    e.preventDefault();
    if (!email.trim() || !pass) {
      warning("Please enter both email and password");
      return;
    }
    setLoading(true);
    try {
      const result = await fetch(`${API_BASE_URL}/api/login`, {
        method: "post",
        body: JSON.stringify({ email: email.trim(), pass }),
        headers: { "Content-type": "application/json;charset=UTF-8" },
      });
      if (result) {
        const res = await result.json();
        if (res.statuscode === 1) {
          success(`Welcome back, ${res.user?.name || "User"}!`);
          setusertype("User");
          localStorage.setItem("Utype", "User");
          if (res.token) localStorage.setItem("lms_auth_token", res.token);
          if (res.user) localStorage.setItem("lms_user", JSON.stringify(res.user));
          navigate("/dashboard");
        } else if (res.statuscode === 2) {
          success("Administrator access granted!");
          setusertype("Admin");
          localStorage.setItem("Utype", res.utype || "Admin");
          if (res.token) localStorage.setItem("lms_auth_token", res.token);
          if (res.user) localStorage.setItem("lms_user", JSON.stringify(res.user));
          navigate("/dashboard");
        } else {
          error(res.message || "Invalid email or password");
        }
      }
    } catch (err) {
      console.error("Login request error:", err);
      error("Unable to reach server. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail("admin@lms.com");
    setPass("admin123");
    info("Filled Admin demo credentials");
  };

  return (
    <>
      <section className="auth-page" ref={containerRef}>
        <div className="auth-shell container">
          <div className="auth-card row g-0 align-items-stretch">
            <div className="col-lg-6">
              <form className="form-panel" onSubmit={login}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="section-kicker mb-0">AUTHENTICATION</span>
                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle small px-2 py-0.5">
                    Secure Portal
                  </span>
                </div>

                <h1 className="h2 fw-bold mb-1">Sign In to LabFlow</h1>
                <p className="auth-subtitle text-muted mb-4">
                  Access telemetry, issue hardware, and manage laboratory facilities.
                </p>

                <div className="mb-3.5">
                  <label className="form-label">Email Address</label>
                  <div className="input-group input-group-lg-themed">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      className="form-control"
                      type="email"
                      placeholder="name@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label mb-0">Password</label>
                    <span className="text-muted small">Case sensitive</span>
                  </div>
                  <div className="input-group input-group-lg-themed">
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      className="form-control border-end-0"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="input-group-text bg-transparent border-start-0 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} text-muted`}></i>
                    </button>
                  </div>
                </div>

                {/* Quick Demo Credentials Chip */}
                <div className="mb-4 p-2.5 rounded-3 bg-light border d-flex align-items-center justify-content-between">
                  <div className="small text-muted">
                    <i className="bi bi-key-fill text-primary me-1"></i> Quick Test:
                  </div>
                  <button
                    type="button"
                    className="btn btn-xs btn-outline-primary py-0.5 px-2"
                    onClick={fillDemoAdmin}
                  >
                    Use Admin Demo
                  </button>
                </div>

                <button
                  className="btn auth-btn w-100 d-flex align-items-center justify-content-center gap-2 py-2.5"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <i className="bi bi-arrow-right"></i>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="col-lg-6">
              <div className="side-panel">
                <span className="section-kicker text-white opacity-75 mb-1">ENTERPRISE SYSTEM</span>
                <h2 className="fw-bold mb-3">Intelligent Laboratory Operations.</h2>
                <p className="mb-4">
                  Streamline hardware lifecycle tracking, prevent stock shortages, and log student lab usage seamlessly.
                </p>

                <ul className="auth-list mb-4">
                  <li>Real-time automated stock count reduction</li>
                  <li>Printable QR asset tags for each device</li>
                  <li>Multi-facility capacity analytics & heatmaps</li>
                </ul>

                <div className="auth-highlight pt-3 border-top border-white border-opacity-10 d-flex align-items-center justify-content-between">
                  <span className="small text-white-50">Need a new faculty account?</span>
                  <Link className="btn auth-outline-btn" to="/register">Create Account</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
