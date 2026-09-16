import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { API_BASE_URL } from "../config";
import { useToast } from "./ToastContext";

export const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error, warning } = useToast();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".auth-card",
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out" }
      );

      gsap.fromTo(
        ".form-panel > *",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", delay: 0.15 }
      );

      gsap.fromTo(
        ".side-panel > *",
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", delay: 0.25 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const register = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !pass) {
      warning("Please fill in all required fields");
      return;
    }
    if (pass.length < 6) {
      warning("Password must be at least 6 characters long");
      return;
    }
    setLoading(true);
    try {
      const result = await fetch(`${API_BASE_URL}/api/register`, {
        method: "post",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), pass }),
        headers: { "Content-type": "application/json;charset=UTF-8" },
      });
      const res = await result.json();
      if (result.ok && res.statuscode === 1) {
        success("Account created successfully! Please sign in.");
        navigate("/");
      } else {
        error(res.message || "Registration failed. Email may already be in use.");
      }
    } catch (err) {
      console.error("Register request error:", err);
      error("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="auth-page" ref={containerRef}>
        <div className="auth-shell container">
          <div className="auth-card row g-0 align-items-stretch">
            <div className="col-lg-6">
              <form className="form-panel" onSubmit={register}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="section-kicker mb-0">REGISTRATION</span>
                  <span className="badge bg-teal-subtle text-teal border border-teal-subtle small px-2 py-0.5">
                    Faculty / Staff
                  </span>
                </div>

                <h1 className="h2 fw-bold mb-1">Create an Account</h1>
                <p className="auth-subtitle text-muted mb-4">
                  Join LabFlow to issue, allocate, and monitor laboratory devices.
                </p>

                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <div className="input-group input-group-lg-themed">
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Dr. Jane Foster"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <div className="input-group input-group-lg-themed">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="jane.foster@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label mb-0">Password</label>
                    <span className="text-muted small">Min. 6 characters</span>
                  </div>
                  <div className="input-group input-group-lg-themed">
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control border-end-0"
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

                <button
                  className="btn auth-btn w-100 d-flex align-items-center justify-content-center gap-2 py-2.5"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <i className="bi bi-person-plus"></i>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="col-lg-6">
              <div className="side-panel">
                <span className="section-kicker text-white opacity-75 mb-1">JOIN LABFLOW</span>
                <h2 className="fw-bold mb-3">Enterprise Lab Oversight Made Simple.</h2>

                <p className="mb-4">
                  Maintain clear inventory audit trails, track equipment distributions across laboratories, and resolve maintenance issues quickly.
                </p>

                <ul className="auth-list mb-4">
                  <li>Instant equipment request dispatch</li>
                  <li>Automated stock remaining telemetry</li>
                  <li>Printable QR asset tags and reports</li>
                </ul>

                <div className="auth-highlight pt-3 border-top border-white border-opacity-10 d-flex align-items-center justify-content-between">
                  <span className="small text-white-50">Already have an account?</span>
                  <Link className="btn auth-outline-btn" to="/">
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
