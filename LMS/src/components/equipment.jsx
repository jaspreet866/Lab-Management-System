import { useContext, useEffect, useState, useRef } from "react";
import { Sidebar } from "./sidebar";
import { useNavigate, Link } from "react-router-dom";
import { Context } from "./context";
import { gsap } from "gsap";
import { API_BASE_URL } from "../config";
import { useToast } from "./ToastContext";

export const AddEquipment = () => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [location, setLocation] = useState("Central Store");
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

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim() || !quantity) {
      warning("Please fill in all required fields");
      return;
    }
    if (Number(quantity) <= 0) {
      warning("Quantity must be greater than 0");
      return;
    }

    setLoading(true);
    try {
      const result = await fetch(`${API_BASE_URL}/api/addequipment`, {
        method: "post",
        body: JSON.stringify({ name: name.trim(), quantity: Number(quantity) }),
        headers: { "Content-type": "application/json;charset=UTF-8" },
      });
      if (result) {
        const res = await result.json();
        if (res.statuscode === 1) {
          success(`"${name}" (${quantity} units) registered to inventory!`);
          setName("");
          setQuantity("");
        } else {
          error(res.message || "Failed to add equipment");
        }
      }
    } catch (err) {
      console.error("Add equipment error:", err);
      error("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const parsedQty = Number(quantity) || 0;
  const stockTier = parsedQty === 0 ? "Empty" : parsedQty <= 5 ? "Low Stock" : "Well Stocked";
  const stockTierClass = parsedQty === 0 ? "text-danger bg-danger-subtle" : parsedQty <= 5 ? "text-warning bg-warning-subtle" : "text-success bg-success-subtle";

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
                    <span className="badge bg-primary-subtle text-primary px-2.5 py-1">
                      <i className="bi bi-box-seam me-1"></i> INVENTORY CATALOG
                    </span>
                    <span className="text-muted small">New Asset Registration</span>
                  </div>
                  <h1 className="h3 fw-bold mb-1">Add Laboratory Equipment</h1>
                  <p className="text-muted small mb-0">
                    Register hardware instruments, tools, and consumables into the centralized lab registry.
                  </p>
                </div>

                <Link to="/dashboard" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5 align-self-start">
                  <i className="bi bi-arrow-left"></i>
                  <span>Back to Inventory</span>
                </Link>
              </div>

              {/* 2-COLUMN FORM & LIVE PREVIEW */}
              <div className="row g-4">
                {/* FORM COLUMN */}
                <div className="col-12 col-xl-7">
                  <div className="form-main-card p-4 rounded-4 shadow-sm border">
                    <div className="d-flex align-items-center justify-content-between mb-4 pb-1">
                      <div className="d-flex align-items-center gap-2.5">
                        <div className="form-step-icon bg-primary text-white">
                          <i className="bi bi-pencil-square"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-0">Equipment Specifications</h6>
                          <small className="text-muted">Enter details below to generate inventory SKU</small>
                        </div>
                      </div>
                      <span className="badge bg-light text-muted">Step 1 of 1</span>
                    </div>

                    <form onSubmit={add}>
                      <div className="mb-3.5">
                        <label className="form-label d-flex justify-content-between">
                          <span>Equipment Name <span className="text-danger">*</span></span>
                          <span className="text-muted small">e.g. Digital Oscilloscope</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-cpu"></i>
                          </span>
                          <input
                            className="form-control"
                            type="text"
                            placeholder="Enter equipment name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="row g-3 mb-3.5">
                        <div className="col-12 col-sm-6">
                          <label className="form-label">Category</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-tag"></i>
                            </span>
                            <select
                              className="form-select"
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                            >
                              <option value="Electronics">Electronics & Kits</option>
                              <option value="Measuring">Measuring Devices</option>
                              <option value="Computers">Computers & Peripherals</option>
                              <option value="Optics">Optics & Sensors</option>
                              <option value="Mechanical">Mechanical Tools</option>
                            </select>
                          </div>
                        </div>

                        <div className="col-12 col-sm-6">
                          <label className="form-label">Storage Location</label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <i className="bi bi-geo-alt"></i>
                            </span>
                            <select
                              className="form-select"
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                            >
                              <option value="Central Store">Central Inventory Store</option>
                              <option value="Rack A - Shelves">Rack A - Shelf Unit</option>
                              <option value="Rack B - Electronics">Rack B - Electronics Bay</option>
                              <option value="Cabinet C - Secure">Cabinet C - High Value</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <label className="form-label mb-0">
                            Initial Stock Quantity <span className="text-danger">*</span>
                          </label>
                          {/* Quick stepper buttons */}
                          <div className="d-flex gap-1">
                            {[1, 5, 10, 25].map((val) => (
                              <button
                                key={val}
                                type="button"
                                className="btn btn-xs btn-outline-secondary py-0 px-2"
                                onClick={() => setQuantity(String((Number(quantity) || 0) + val))}
                              >
                                +{val}
                              </button>
                            ))}
                            {quantity && (
                              <button
                                type="button"
                                className="btn btn-xs btn-outline-danger py-0 px-2"
                                onClick={() => setQuantity("")}
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-hash"></i>
                          </span>
                          <input
                            className="form-control"
                            type="number"
                            min="1"
                            placeholder="Enter number of units (e.g. 10)"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                          />
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
                            <span>Registering into Database...</span>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-plus-circle"></i>
                            <span>Register Equipment to Inventory</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* LIVE PREVIEW COLUMN */}
                <div className="col-12 col-xl-5">
                  <div className="form-preview-card p-4 rounded-4 shadow-sm border h-100">
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-1">
                      <div className="d-flex align-items-center gap-2">
                        <span className="pulse-dot"></span>
                        <h6 className="fw-bold mb-0 small text-uppercase letter-spacing-1">Live Asset Preview</h6>
                      </div>
                      <span className="badge bg-primary-subtle text-primary">
                        Live Render
                      </span>
                    </div>

                    <div className="asset-mockup-card p-3.5 rounded-3 mb-3">
                      <div className="d-flex align-items-start justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <div className="asset-mockup-icon bg-primary text-white">
                            <i className="bi bi-cpu-fill"></i>
                          </div>
                          <div>
                            <span className="badge bg-light text-secondary mb-1">{category}</span>
                            <h5 className="fw-bold mb-0 text-truncate" style={{ maxWidth: "200px" }}>
                              {name.trim() || "Item Name"}
                            </h5>
                          </div>
                        </div>
                        <span className={`badge ${stockTierClass} px-2.5 py-1 fw-semibold`}>
                          {stockTier}
                        </span>
                      </div>

                      <div className="asset-specs-grid p-3 rounded-3 mb-3">
                        <div className="d-flex justify-content-between mb-1.5">
                          <span className="text-muted small">Assigned Storage:</span>
                          <span className="fw-semibold small text-themed-main">{location}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1.5">
                          <span className="text-muted small">Registered Stock:</span>
                          <span className="fw-bold small text-primary">{parsedQty} Units</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted small">Generated Mock ID:</span>
                          <span className="font-monospace small text-muted">LMS-EQ-{name ? name.slice(0, 3).toUpperCase() : "NEW"}-01</span>
                        </div>
                      </div>

                      {/* Visual stock gauge */}
                      <div className="mb-2">
                        <div className="d-flex justify-content-between small text-muted mb-1">
                          <span>Stock Availability Gauge</span>
                          <span>{parsedQty > 50 ? "100%" : `${Math.min(parsedQty * 2, 100)}%`}</span>
                        </div>
                        <div className="progress" style={{ height: "6px" }}>
                          <div
                            className={`progress-bar ${parsedQty <= 5 ? "bg-warning" : "bg-primary"}`}
                            role="progressbar"
                            style={{ width: `${Math.min(parsedQty * 2, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="preview-tip-box p-3 rounded-3">
                      <div className="d-flex gap-2">
                        <i className="bi bi-lightbulb-fill text-warning fs-5 flex-shrink-0"></i>
                        <p className="small text-muted mb-0">
                          Once registered, a scannable <strong>QR Asset Tag</strong> is automatically generated and available directly from the Dashboard table.
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
