import { useState, useEffect, useRef } from "react";
import { Sidebar } from "./sidebar";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { API_BASE_URL } from "../config";
import { useToast } from "./ToastContext";

export const Return = () => {
  const [name, setName] = useState("");
  const [labname, setLabname] = useState("");
  const [issue, setIssue] = useState("None / Working fine");
  const [notes, setNotes] = useState("");
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
    if (!name.trim() || !labname.trim() || !issue) {
      warning("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const fullIssue = notes.trim() ? `${issue} — Notes: ${notes.trim()}` : issue;
      const result = await fetch(`${API_BASE_URL}/api/return`, {
        method: "post",
        body: JSON.stringify({ name: name.trim(), labname: labname.trim(), issue: fullIssue }),
        headers: { "Content-type": "application/json;charset=UTF-8" },
      });
      if (result) {
        const res = await result.json();
        if (res.statuscode === 1) {
          success(`Return report for "${name}" submitted successfully!`);
          setName("");
          setLabname("");
          setIssue("None / Working fine");
          setNotes("");
        } else {
          error(res.message || "Failed to record return report");
        }
      }
    } catch (err) {
      console.error("Return error:", err);
      error("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const isSevere = issue === "Damage of Parts" || issue === "Not Working";
  const issueSeverityClass = isSevere ? "bg-danger-subtle text-danger" : issue === "Wire Problem" ? "bg-warning-subtle text-warning" : "bg-success-subtle text-success";

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
                    <span className="badge bg-amber-subtle text-amber px-2.5 py-1">
                      <i className="bi bi-arrow-return-left me-1"></i> LOGISTICS & MAINTENANCE
                    </span>
                    <span className="text-muted small">Device Check-In</span>
                  </div>
                  <h1 className="h3 fw-bold mb-1">Record Equipment Return</h1>
                  <p className="text-muted small mb-0">
                    Log returned laboratory equipment, audit hardware condition, and flag items for technician repair.
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
                        <div className="form-step-icon bg-amber text-white">
                          <i className="bi bi-clipboard-check"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0">Return Intake Form</h6>
                          <small className="text-muted">Document hardware condition and origin</small>
                        </div>
                      </div>
                      <span className="badge bg-light text-muted">Inspection Triage</span>
                    </div>

                    <form onSubmit={add}>
                      <div className="mb-3.5">
                        <label className="form-label d-flex justify-content-between">
                          <span>Equipment / Device Name <span className="text-danger">*</span></span>
                          <span className="text-muted small">e.g. Tektronix Oscilloscope</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-pc-display"></i>
                          </span>
                          <input
                            className="form-control"
                            type="text"
                            placeholder="Enter device name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3.5">
                        <label className="form-label">Returning Laboratory <span className="text-danger">*</span></label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-building"></i>
                          </span>
                          <input
                            className="form-control"
                            type="text"
                            placeholder="e.g. Physics Lab 01, Embedded Systems Lab"
                            value={labname}
                            onChange={(e) => setLabname(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3.5">
                        <label className="form-label">Hardware Condition / Issue Category <span className="text-danger">*</span></label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-shield-exclamation"></i>
                          </span>
                          <select
                            className="form-select"
                            value={issue}
                            onChange={(e) => setIssue(e.target.value)}
                            required
                          >
                            <option value="None / Working fine">✨ Normal Return — Working Fine</option>
                            <option value="Wire Problem">🔌 Wire / Cable Problem</option>
                            <option value="Not Working">⚡ Not Working / Power Failure</option>
                            <option value="Damage of Parts">💥 Physical Damage of Parts</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="form-label">Technician Notes / Remarks (Optional)</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          placeholder="Add any observations (e.g. channel 2 probe disconnected)..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        ></textarea>
                      </div>

                      <button
                        className="btn auth-btn w-100 d-flex align-items-center justify-content-center gap-2 py-2.5"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span>Filing Return Ticket...</span>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-clipboard2-check"></i>
                            <span>Submit Return & Log Inspection</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* LIVE RETURN TICKET PREVIEW */}
                <div className="col-12 col-xl-5">
                  <div className="form-preview-card p-4 rounded-4 shadow-sm border h-100">
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-1">
                      <div className="d-flex align-items-center gap-2">
                        <span className="pulse-dot"></span>
                        <h6 className="fw-bold mb-0 small text-uppercase letter-spacing-1">Return Ticket Live Preview</h6>
                      </div>
                      <span className="badge bg-amber-subtle text-amber">
                        Live Ticket
                      </span>
                    </div>

                    <div className="return-mockup-card p-3.5 rounded-3 mb-3">
                      <div className="d-flex align-items-start justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="asset-mockup-icon bg-amber text-white">
                            <i className="bi bi-arrow-down-left-circle-fill"></i>
                          </div>
                          <div>
                            <span className="badge bg-light text-secondary mb-1">
                              Origin: {labname.trim() || "Unspecified Lab"}
                            </span>
                            <h5 className="fw-bold mb-0 text-truncate" style={{ maxWidth: "200px" }}>
                              {name.trim() || "Device Name"}
                            </h5>
                          </div>
                        </div>
                      </div>

                      <div className="asset-specs-grid p-3 rounded-3 mb-3">
                        <div className="d-flex justify-content-between mb-1.5 align-items-center">
                          <span className="text-muted small">Diagnostic Status:</span>
                          <span className={`badge ${issueSeverityClass} px-2.5 py-1 fw-semibold`}>
                            {issue}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-1.5">
                          <span className="text-muted small">Ticket Tracking ID:</span>
                          <span className="font-monospace small text-muted">RTN-{Math.floor(1000 + Math.random() * 9000)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1.5">
                          <span className="text-muted small">Triage Routing:</span>
                          <span className="fw-semibold small text-themed-main">
                            {isSevere ? "⚠️ Technician Repair Bay" : "✅ Restock to Central Store"}
                          </span>
                        </div>
                        {notes.trim() && (
                          <div className="pt-1.5">
                            <span className="text-muted small d-block mb-1">Attached Notes:</span>
                            <span className="small text-themed-main fst-italic">"{notes.trim()}"</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="preview-tip-box p-3 rounded-3">
                      <div className="d-flex gap-2">
                        <i className="bi bi-tools text-amber fs-5 flex-shrink-0"></i>
                        <p className="small text-muted mb-0">
                          Submitted returns are archived in the <strong>Return Reports</strong> audit table on the main dashboard for historical tracing.
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
