import { useContext, useEffect, useState, useRef } from "react";
import { Sidebar } from "./sidebar";
import { useNavigate, Link } from "react-router-dom";
import { Context } from "./context";
import { gsap } from "gsap";
import { API_BASE_URL } from "../config";
import { useToast } from "./ToastContext";

export const Allocate = () => {
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [quantity, setQuantity] = useState("");
  const [allequip, setAllequip] = useState([]);
  const [equipment, setEquipment] = useState("");
  const [loading, setLoading] = useState(false);
  const { usertype } = useContext(Context);
  const { success, error, warning } = useToast();
  const navigate = useNavigate();
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

  useEffect(() => {
    if (usertype !== "Admin" && localStorage.getItem("Utype") !== "Admin") {
      navigate("/");
    }
  }, [usertype, navigate]);

  useEffect(() => {
    show();
    show2();
  }, []);

  const show = async () => {
    try {
      const result = await fetch(`${API_BASE_URL}/api/getlab`, { method: "get" });
      const res = await result.json();
      if (res.statuscode === 1) setLabs(res.data || []);
    } catch (err) {
      console.error("Get lab error:", err);
    }
  };

  const show2 = async () => {
    try {
      const result = await fetch(`${API_BASE_URL}/api/allequipments`, { method: "get" });
      const res = await result.json();
      if (res.statuscode === 1) setAllequip(res.data || []);
    } catch (err) {
      console.error("Get equipments error:", err);
    }
  };

  const upd = async (newquantity) => {
    try {
      await fetch(`${API_BASE_URL}/api/updateequip/${equipment}`, {
        method: "put",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newquantity }),
      });
    } catch (err) {
      console.error("Update equipment error:", err);
    }
  };

  const allocate = async (e) => {
    e.preventDefault();

    const selectedLabDetails = labs.find((item) => item._id === selectedLab);
    const selectedEquipment = allequip.find((item) => item._id === equipment);

    if (!selectedLabDetails) {
      warning("Please select a target lab");
      return;
    }

    if (!selectedEquipment) {
      warning("Please select an equipment item");
      return;
    }

    if (!issueDate) {
      warning("Please select an issue date");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      warning("Please enter a valid quantity (greater than 0)");
      return;
    }

    if (selectedEquipment.Quantity < Number(quantity)) {
      warning(`Insufficient stock! Only ${selectedEquipment.Quantity} units available.`);
      return;
    }

    setLoading(true);
    try {
      const result = await fetch(`${API_BASE_URL}/api/allocate`, {
        method: "post",
        body: JSON.stringify({
          selectedLab: selectedLabDetails.LabName,
          issueDate,
          quantity: Number(quantity),
          equipment: selectedEquipment.EquipmentName,
        }),
        headers: { "Content-type": "application/json" },
      });

      const res = await result.json();

      if (res.statuscode === 1) {
        success(`Successfully allocated ${quantity} ${selectedEquipment.EquipmentName} to ${selectedLabDetails.LabName}!`);

        const remainingQuantity = selectedEquipment.Quantity - Number(quantity);
        await upd(remainingQuantity);

        setSelectedLab("");
        setEquipment("");
        setQuantity("");

        // Refresh equipment list
        show2();
      } else {
        error(res.message || "Allocation failed. Please check server logs.");
      }
    } catch (err) {
      console.error("Allocation error:", err);
      error("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const activeEquipment = allequip.find((item) => item._id === equipment);
  const activeLab = labs.find((item) => item._id === selectedLab);
  const requestedQty = Number(quantity) || 0;
  const currentAvailable = activeEquipment ? Number(activeEquipment.Quantity) : 0;
  const remainingStock = Math.max(0, currentAvailable - requestedQty);
  const isOverLimit = activeEquipment && requestedQty > currentAvailable;

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
                    <span className="badge bg-purple-subtle text-purple px-2.5 py-1">
                      <i className="bi bi-box-arrow-up-right me-1"></i> LOGISTICS & DISPATCH
                    </span>
                    <span className="text-muted small">Equipment Allocation</span>
                  </div>
                  <h1 className="h3 fw-bold mb-1">Issue & Allocate Equipment</h1>
                  <p className="text-muted small mb-0">
                    Transfer stock from central inventory to designated lab facilities with automated inventory reduction.
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
                        <div className="form-step-icon bg-purple text-white">
                          <i className="bi bi-send-check"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0">Dispatch Specifications</h6>
                          <small className="text-muted">Select destination and stock amount</small>
                        </div>
                      </div>
                      <span className="badge bg-light text-muted">Live Stock Sync</span>
                    </div>

                    <form onSubmit={allocate}>
                      <div className="mb-3.5">
                        <label className="form-label">
                          Destination Laboratory <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-building"></i>
                          </span>
                          <select
                            className="form-select"
                            value={selectedLab}
                            onChange={(e) => setSelectedLab(e.target.value)}
                            required
                          >
                            <option value="">Select Target Lab</option>
                            {labs.map((a) => (
                              <option key={a._id} value={a._id}>
                                {a.LabName} (Lead: {a.LabIncharge})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mb-3.5">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <label className="form-label mb-0">
                            Select Equipment Item <span className="text-danger">*</span>
                          </label>
                          {activeEquipment && (
                            <span className="badge bg-success-subtle text-success">
                              Available: {activeEquipment.Quantity} units
                            </span>
                          )}
                        </div>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-cpu"></i>
                          </span>
                          <select
                            className="form-select"
                            value={equipment}
                            onChange={(e) => setEquipment(e.target.value)}
                            required
                          >
                            <option value="">Select Equipment</option>
                            {allequip.map((a) => (
                              <option key={a._id} value={a._id}>
                                {a.EquipmentName} — [{a.Quantity} in stock]
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="row g-3 mb-4">
                        <div className="col-12 col-sm-6">
                          <label className="form-label">Issue Date <span className="text-danger">*</span></label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-calendar3"></i>
                            </span>
                            <input
                              className="form-control"
                              type="date"
                              value={issueDate}
                              onChange={(e) => setIssueDate(e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="col-12 col-sm-6">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <label className="form-label mb-0">Quantity <span className="text-danger">*</span></label>
                            {activeEquipment && (
                              <button
                                type="button"
                                className="btn btn-xs btn-outline-primary py-0 px-1.5"
                                onClick={() => setQuantity(String(activeEquipment.Quantity))}
                              >
                                Max ({activeEquipment.Quantity})
                              </button>
                            )}
                          </div>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-hash"></i>
                            </span>
                            <input
                              className="form-control"
                              type="number"
                              min="1"
                              max={activeEquipment ? activeEquipment.Quantity : undefined}
                              value={quantity}
                              placeholder="Qty to issue"
                              onChange={(e) => setQuantity(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {isOverLimit && (
                        <div className="alert alert-danger py-2.5 px-3 rounded-3 d-flex align-items-center gap-2 mb-3" role="alert">
                          <i className="bi bi-exclamation-octagon-fill text-danger fs-5"></i>
                          <small>Quantity exceeds currently available stock ({currentAvailable} units).</small>
                        </div>
                      )}

                      <button
                        className="btn auth-btn w-100 d-flex align-items-center justify-content-center gap-2 py-2.5"
                        type="submit"
                        disabled={loading || isOverLimit}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span>Authorizing Stock Transfer...</span>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send-check"></i>
                            <span>Authorize & Dispatch Allocation</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* LIVE DISPATCH MANIFEST PREVIEW */}
                <div className="col-12 col-xl-5">
                  <div className="form-preview-card p-4 rounded-4 shadow-sm border h-100">
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-1">
                      <div className="d-flex align-items-center gap-2">
                        <span className="pulse-dot"></span>
                        <h6 className="fw-bold mb-0 small text-uppercase letter-spacing-1">Dispatch Manifest</h6>
                      </div>
                      <span className="badge bg-purple-subtle text-purple">
                        Live Calculator
                      </span>
                    </div>

                    <div className="dispatch-mockup-card p-3.5 rounded-3 mb-3">
                      {/* Flow Diagram */}
                      <div className="d-flex align-items-center justify-content-between p-2.5 rounded-3 bg-light mb-3">
                        <div className="text-center" style={{ width: "40%" }}>
                          <span className="badge bg-secondary-subtle text-secondary small d-block mb-1">Source</span>
                          <strong className="small text-themed-main d-block text-truncate">Central Store</strong>
                        </div>
                        <div className="text-primary fs-4 px-1">
                          <i className="bi bi-arrow-right-circle-fill"></i>
                        </div>
                        <div className="text-center" style={{ width: "40%" }}>
                          <span className="badge bg-purple-subtle text-purple small d-block mb-1">Destination</span>
                          <strong className="small text-themed-main d-block text-truncate">
                            {activeLab ? activeLab.LabName : "Target Lab"}
                          </strong>
                        </div>
                      </div>

                      <div className="asset-specs-grid p-3 rounded-3 mb-3">
                        <div className="d-flex justify-content-between mb-1.5">
                          <span className="text-muted small">Equipment:</span>
                          <span className="fw-bold small text-themed-main">{activeEquipment ? activeEquipment.EquipmentName : "Not selected"}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1.5">
                          <span className="text-muted small">Units Dispatched:</span>
                          <span className="fw-bold small text-purple">{requestedQty} Units</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1.5">
                          <span className="text-muted small">Dispatch Date:</span>
                          <span className="small text-themed-main">{issueDate || "Today"}</span>
                        </div>
                        <div className="d-flex justify-content-between pt-1">
                          <span className="text-muted small">Projected Central Stock:</span>
                          <span className={`fw-bold small ${remainingStock <= 5 ? "text-warning" : "text-success"}`}>
                            {activeEquipment ? `${remainingStock} Units remaining` : "—"}
                          </span>
                        </div>
                      </div>

                      {activeEquipment && (
                        <div className="p-2.5 rounded-3 bg-light">
                          <div className="d-flex justify-content-between small text-muted mb-1">
                            <span>Remaining Stock Ratio</span>
                            <span>{currentAvailable > 0 ? `${Math.round((remainingStock / currentAvailable) * 100)}%` : "0%"}</span>
                          </div>
                          <div className="progress" style={{ height: "6px" }}>
                            <div
                              className={`progress-bar ${remainingStock <= 5 ? "bg-warning" : "bg-success"}`}
                              role="progressbar"
                              style={{ width: `${currentAvailable > 0 ? (remainingStock / currentAvailable) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="preview-tip-box p-3 rounded-3">
                      <div className="d-flex gap-2">
                        <i className="bi bi-shield-check text-purple fs-5 flex-shrink-0"></i>
                        <p className="small text-muted mb-0">
                          Stock deduction occurs in real time. If the device needs to be returned later, it will be cataloged under <strong>Record Return</strong>.
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
