import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { gsap } from "gsap";
import { API_BASE_URL } from "../config";

export const LabDash = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const labid = searchParams.get("id");
  const labdashRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".lab-hero-card",
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
      gsap.fromTo(".lab-grid-item",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out", delay: 0.1 }
      );
    }, labdashRef);

    return () => ctx.revert();
  }, [loading, data.length]);

  const totalCapacity = data.reduce((total, item) => total + Number(item.Capacity || 0), 0);

  useEffect(() => {
    const fetchLabData = async () => {
      setLoading(true);
      try {
        const url = labid
          ? `${API_BASE_URL}/api/getlab2/${labid}`
          : `${API_BASE_URL}/api/getlab`;
        const result = await fetch(url, { method: "get" });
        if (result) {
          const res = await result.json();
          if (res.statuscode === 1) {
            setData(res.data || []);
          } else {
            setData([]);
          }
        }
      } catch (err) {
        console.error("Failed to load lab data:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLabData();
  }, [labid]);

  return (
    <main className="dashboard-page" ref={labdashRef}>
      <div className="container-fluid dashboard-shell px-3 px-md-4 py-3">
        <div className="row g-4 align-items-start">
          <div className="col-12 col-lg-auto position-sticky" style={{ top: "90px", zIndex: 10 }}>
            <Sidebar />
          </div>

          <div className="col">
            {/* HERO BANNER */}
            <div className="lab-hero-card mb-4 p-4 rounded-4 shadow-sm border">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-teal-subtle text-teal px-2.5 py-1">
                      <i className="bi bi-diagram-3 me-1"></i> FACILITY TELEMETRY
                    </span>
                    <span className="text-muted small">
                      {labid ? "Single Facility View" : "All Registered Laboratories"}
                    </span>
                  </div>
                  <h1 className="h3 fw-bold mb-1">
                    {labid && data.length > 0 ? `${data[0].LabName} Dashboard` : "Laboratory Infrastructure"}
                  </h1>
                  <p className="text-muted small mb-0">
                    Workstation occupancy, supervising faculty incharge, and quick equipment allocation shortcuts.
                  </p>
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2">
                  <div className="p-2.5 px-3 rounded-3 bg-light text-center">
                    <span className="d-block text-muted" style={{ fontSize: "0.72rem" }}>Active Rooms</span>
                    <strong className="h5 fw-bold text-themed-main mb-0">{data.length}</strong>
                  </div>
                  <div className="p-2.5 px-3 rounded-3 bg-light text-center">
                    <span className="d-block text-muted" style={{ fontSize: "0.72rem" }}>Total Capacity</span>
                    <strong className="h5 fw-bold text-primary mb-0">{totalCapacity}</strong>
                  </div>
                  <Link to="/lab" className="btn btn-sm btn-primary d-flex align-items-center gap-1.5 px-3 py-2">
                    <i className="bi bi-plus-lg"></i>
                    <span>Add Facility</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* LAB CARDS GRID */}
            {loading ? (
              <div className="d-flex flex-column align-items-center justify-content-center my-5 py-5 text-muted">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span className="small">Retrieving laboratory records...</span>
              </div>
            ) : data.length === 0 ? (
              <div className="p-5 text-center rounded-4 bg-card border shadow-sm my-4">
                <i className="bi bi-building-x text-muted fs-1 mb-2 d-block"></i>
                <h5 className="fw-bold mb-1">No laboratory records found</h5>
                <p className="text-muted small mb-3">Get started by creating your first lab facility.</p>
                <Link to="/lab" className="btn btn-sm btn-primary">
                  <i className="bi bi-plus-lg me-1"></i> Setup New Lab
                </Link>
              </div>
            ) : (
              <div className="row g-4">
                {data.map((item) => {
                  const cap = Number(item.Capacity || 0);
                  return (
                    <div className="col-12 col-md-6 col-xl-4 lab-grid-item" key={item._id || item.LabName}>
                      <div className="lab-facility-card p-4 rounded-4 shadow-sm border h-100 d-flex flex-column justify-content-between">
                        <div>
                          {/* Header */}
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <div className="d-flex align-items-center gap-2.5">
                              <div className="lab-card-icon bg-teal-subtle text-teal">
                                <i className="bi bi-building"></i>
                              </div>
                              <div>
                                <h5 className="fw-bold mb-0 text-themed-main">{item.LabName}</h5>
                                <span className="text-muted" style={{ fontSize: "0.72rem" }}>
                                  ID: {(item._id || "").slice(-6).toUpperCase() || "LAB-01"}
                                </span>
                              </div>
                            </div>
                            <span className="badge bg-success-subtle text-success px-2.5 py-1">
                              Operational
                            </span>
                          </div>

                          {/* Facility details */}
                          <div className="asset-specs-grid p-3 rounded-3 mb-3">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="small text-muted">Supervising Lead:</span>
                              <strong className="small text-themed-main">{item.LabIncharge || "Unassigned"}</strong>
                            </div>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="small text-muted">Max Capacity:</span>
                              <span className="fw-bold small text-primary">{cap} Workbenches</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-between">
                              <span className="small text-muted">Facility Status:</span>
                              <span className="small text-success fw-semibold">
                                <span className="pulse-dot me-1"></span> Available
                              </span>
                            </div>
                          </div>

                          {/* Capacity meter */}
                          <div className="mb-3">
                            <div className="d-flex justify-content-between text-muted" style={{ fontSize: "0.72rem" }}>
                              <span>Capacity Utilization</span>
                              <span>{cap > 50 ? "High Capacity" : cap > 25 ? "Standard" : "Compact"}</span>
                            </div>
                            <div className="progress mt-1" style={{ height: "6px" }}>
                              <div
                                className="progress-bar bg-teal"
                                role="progressbar"
                                style={{ width: `${Math.min(cap * 1.8, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="d-flex align-items-center justify-content-between pt-2">
                          <Link
                            to="/allocate"
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1.5"
                          >
                            <i className="bi bi-box-arrow-up"></i>
                            <span>Issue Stock</span>
                          </Link>
                          <Link
                            to="/return"
                            className="btn btn-sm btn-primary d-flex align-items-center gap-1.5"
                          >
                            <i className="bi bi-arrow-return-left"></i>
                            <span>Return Device</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};