import { useState, useEffect, useRef } from "react";
import { Sidebar } from "./sidebar";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { API_BASE_URL } from "../config";
import { useToast } from "./ToastContext";

export const Lab = () => {
  const [incharge, setIncharge] = useState("");
  const [labname, setLabname] = useState("");
  const [capacity, setCapacity] = useState("");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [loading, setLoading] = useState(false);
  const { success, error, warning } = useToast();
  const formRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".form-hero-badge",
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
      gsap.fromTo(".form-main-card",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.05 }
      );
      gsap.fromTo(".form-preview-card",
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", delay: 0.1 }
      );
    }, formRef);
    return () => ctx.revert();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!incharge.trim() || !labname.trim() || !capacity) {
      warning("Please fill in all required fields");
      return;
    }
    if (Number(capacity) <= 0) {
      warning("Capacity must be at least 1 student");
      return;
    }

    setLoading(true);
    try {
      const result = await fetch(`${API_BASE_URL}/api/addlab`, {
        method: "post",
        body: JSON.stringify({
          incharge: incharge.trim(),
          labname: labname.trim(),
          capacity: Number(capacity)
        }),
        headers: { "Content-type": "application/json;charset=UTF-8" },
      });
      if (result) {
        const res = await result.json();
        if (res.statuscode === 1) {
          success(`Laboratory "${labname}" created successfully!`);
          setIncharge("");
          setLabname("");
          setCapacity("");
        } else {
          error(res.message || "Failed to add lab facility");
        }
      }
    } catch (err) {
      console.error("Add lab error:", err);
      error("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const parsedCap = Number(capacity) || 0;

  return (
    <>
      <section className="management-page" ref={formRef}>
        <div className="container-fluid dashboard-shell px-3 px-md-4 py-3">
          <div className="row g-4 align-items-start">
            <div className="col-12 col-lg-auto position-sticky" style={{ top: "90px", zIndex: 10 }}>
              <Sidebar />
            </div>

            <div className="col">
              {/* PAGE HEADER */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1 form-hero-badge">
                    <span className="badge bg-teal-subtle text-teal px-2.5 py-1">
                      <i className="bi bi-building-gear me-1"></i> INFRASTRUCTURE
                    </span>
                    <span className="text-muted small">Facility Setup</span>
                  </div>
                  <h1 className="h3 fw-bold mb-1">Configure Laboratory Room</h1>
                  <p className="text-muted small mb-0">
                    Register departmental laboratory rooms, assign supervising in-charges, and configure seating.
                  </p>
                </div>

                <Link to="/dashboard" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5 align-self-start">
                  <i className="bi bi-arrow-left"></i>
                  <span>Back to Dashboard</span>
                </Link>
              </div>

              {/* 2-COLUMN FORM & LIVE PREVIEW */}
              <div className="row g-4">
                {/* FORM COLUMN */}
                <div className="col-12 col-xl-7">
                  <div className="form-main-card p-4 rounded-4 shadow-sm border">
                    <div className="d-flex align-items-center justify-content-between mb-4 pb-1">
                      <div className="d-flex align-items-center gap-2.5">
                        <div className="form-step-icon bg-teal text-white">
                          <i className="bi bi-building-add"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0">Laboratory Information</h6>
                          <small className="text-muted">Enter room specifications and faculty allocation</small>
                        </div>
                      </div>
                      <span className="badge bg-light text-muted">Step 1 of 1</span>
                    </div>

                    <form onSubmit={add}>
                      <div className="mb-3.5">
                        <label className="form-label d-flex justify-content-between">
                          <span>Laboratory Name / Number <span className="text-danger">*</span></span>
                          <span className="text-muted small">e.g. Embedded Systems Lab 02</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-door-open"></i>
                          </span>
                          <input
                            className="form-control"
                            type="text"
                            placeholder="Enter lab room name..."
                            value={labname}
                            onChange={(e) => setLabname(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3.5">
                        <label className="form-label">Supervising Faculty / Incharge <span className="text-danger">*</span></label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-person-badge"></i>
                          </span>
                          <input
                            className="form-control"
                            type="text"
                            placeholder="e.g. Prof. Alan Turing"
                            value={incharge}
                            onChange={(e) => setIncharge(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="row g-3 mb-3.5">
                        <div className="col-12 col-sm-6">
                          <label className="form-label">Department</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-diagram-3"></i>
                            </span>
                            <select
                              className="form-select"
                              value={department}
                              onChange={(e) => setDepartment(e.target.value)}
                            >
                              <option value="Computer Science & Engineering">Computer Science & IT</option>
                              <option value="Electronics & Communication">Electronics & Comm.</option>
                              <option value="Electrical Engineering">Electrical Eng.</option>
                              <option value="Mechanical Engineering">Mechanical Eng.</option>
                              <option value="Physics & Materials">Physics & Sciences</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-12 col-sm-6">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="form-label mb-0">
                              Workstation Capacity <span className="text-danger">*</span>
                            </label>
                            <div className="d-flex gap-1">
                              {[20, 30, 45, 60].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  className="btn btn-xs btn-outline-secondary py-0 px-1.5"
                                  onClick={() => setCapacity(String(c))}
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-people"></i>
                            </span>
                            <input
                              className="form-control"
                              type="number"
                              min="1"
                              placeholder="e.g. 35"
                              value={capacity}
                              onChange={(e) => setCapacity(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        className="btn auth-btn w-100 d-flex align-items-center justify-content-center gap-2 py-2.5 mt-4"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span>Setting up Laboratory...</span>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-building-check"></i>
                            <span>Create Laboratory Facility</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* LIVE FACILITY PREVIEW COLUMN */}
                <div className="col-12 col-xl-5">
                  <div className="form-preview-card p-4 rounded-4 shadow-sm border h-100">
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-1">
                      <div className="d-flex align-items-center gap-2">
                        <span className="pulse-dot"></span>
                        <h6 className="fw-bold mb-0 small text-uppercase letter-spacing-1">Facility Live Card</h6>
                      </div>
                      <span className="badge bg-teal-subtle text-teal">
                        Live Preview
                      </span>
                    </div>

                    <div className="facility-mockup-card p-3.5 rounded-3 mb-3">
                      <div className="d-flex align-items-start justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="asset-mockup-icon bg-teal text-white">
                            <i className="bi bi-building-fill"></i>
                          </div>
                          <div>
                            <span className="badge bg-light text-secondary mb-1">{department}</span>
                            <h5 className="fw-bold mb-0 text-truncate" style={{ maxWidth: "200px" }}>
                              {labname.trim() || "Laboratory Name"}
                            </h5>
                          </div>
                        </div>
                        <span className="badge bg-success-subtle text-success px-2.5 py-1">
                          Operational
                        </span>
                      </div>

                      <div className="asset-specs-grid p-3 rounded-3 mb-3">
                        <div className="d-flex justify-content-between mb-1.5">
                          <span className="text-muted small">Faculty Lead:</span>
                          <span className="fw-bold small text-themed-main">{incharge.trim() || "Unassigned"}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1.5">
                          <span className="text-muted small">Maximum Workbenches:</span>
                          <span className="fw-bold small text-primary">{parsedCap} Students</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted small">System Routing ID:</span>
                          <span className="font-monospace small text-muted">LAB-{labname ? labname.replace(/\s+/g, "").slice(0, 4).toUpperCase() : "FACILITY"}</span>
                        </div>
                      </div>

                      {/* Visual capacity indicator */}
                      <div>
                        <div className="d-flex justify-content-between small text-muted mb-1">
                          <span>Seating Capacity Density</span>
                          <span>{parsedCap > 60 ? "Large Hall" : parsedCap > 30 ? "Standard Lab" : "Specialized"}</span>
                        </div>
                        <div className="progress" style={{ height: "6px" }}>
                          <div
                            className="progress-bar bg-teal"
                            role="progressbar"
                            style={{ width: `${Math.min(parsedCap * 1.6, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="preview-tip-box p-3 rounded-3">
                      <div className="d-flex gap-2">
                        <i className="bi bi-info-circle-fill text-teal fs-5 flex-shrink-0"></i>
                        <p className="small text-muted mb-0">
                          Registered labs immediately become available in the header navigation menu and for equipment issuance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
};
