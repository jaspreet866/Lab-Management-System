import { useContext, useEffect, useState, useRef, useMemo } from "react";
import { Sidebar } from "./sidebar";
import { Context } from "./context";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";

const CHART_COLORS = ["#4f46e5", "#0d9488", "#f59e0b", "#ec4899", "#8b5cf6", "#3b82f6", "#10b981"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <div className="tooltip-title">{label || payload[0].name}</div>
        <div className="tooltip-value">
          {payload[0].value} {payload[0].dataKey === "capacity" ? "Capacity" : "Units"}
        </div>
      </div>
    );
  }
  return null;
};

export const Dashboard = () => {
  const [equip, setallequip] = useState([]);
  const [labs, setalllabs] = useState([]);
  const [returndata, setallreturndata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { usertype } = useContext(Context);
  const dashboardRef = useRef(null);

  // Memoized Chart Data
  const equipmentPieData = useMemo(() => {
    if (!equip || equip.length === 0) return [];
    return equip.slice(0, 7).map((item) => ({
      name: item.EquipmentName || "Item",
      value: Number(item.Quantity || 0),
    }));
  }, [equip]);

  const labBarData = useMemo(() => {
    if (!labs || labs.length === 0) return [];
    return labs.map((lab) => ({
      name: lab.LabName || "Lab",
      capacity: Number(lab.Capacity || 0),
    }));
  }, [labs]);

  // Entrance animations for static shell elements
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade and slide down header
      gsap.fromTo(
        ".dashboard-header",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );

      // Stagger metrics cards
      gsap.fromTo(
        ".dashboard-metric",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out", delay: 0.1 }
      );

      // Slide up main panels
      gsap.fromTo(
        ".dashboard-panel",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.25 }
      );
    }, dashboardRef);

    return () => ctx.revert();
  }, []);

  // GSAP Count-up numbers & Chart stagger entrance once loading completes
  useEffect(() => {
    if (!loading) {
      const totalEquip = equip.reduce((total, item) => total + Number(item.Quantity || 0), 0);
      const totalCap = labs.reduce((total, item) => total + Number(item.Capacity || 0), 0);

      const targets = [
        { id: "metric-labs-val", endVal: labs.length },
        { id: "metric-equip-val", endVal: totalEquip },
        { id: "metric-capacity-val", endVal: totalCap },
      ];

      targets.forEach((t) => {
        const el = document.getElementById(t.id);
        if (el) {
          const counterObj = { val: 0 };
          gsap.to(counterObj, {
            val: t.endVal,
            duration: 1.2,
            ease: "power2.out",
            onUpdate: () => {
              el.innerText = Math.round(counterObj.val);
            },
          });
        }
      });

      const ctx = gsap.context(() => {
        // Stagger chart panels
        gsap.fromTo(
          ".chart-panel",
          { opacity: 0, y: 25, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12, ease: "power2.out" }
        );

        // Stagger equipment cards
        if (equip.length > 0) {
          gsap.fromTo(
            ".equipment-card",
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: "power2.out" }
          );
        }

        // Stagger lab details cards
        if (labs.length > 0) {
          gsap.fromTo(
            ".lab-list-item",
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: "power2.out" }
          );
        }

        // Stagger returned items
        if (returndata.length > 0) {
          gsap.fromTo(
            ".return-item",
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.03, ease: "power2.out" }
          );
        }
      }, dashboardRef);

      return () => ctx.revert();
    }
  }, [loading, equip.length, labs.length, returndata.length]);

  useEffect(() => {
    if (usertype !== "Admin" && localStorage.getItem("Utype") !== "Admin") {
      navigate("/");
    }
  }, [usertype, navigate]);

  const show = async () => {
    const result = await fetch("https://lab-management-system-n3i5.onrender.com/api/allequipments", {
      method: "get",
    });
    if (result) {
      const res = await result.json();
      if (res.statuscode === 1) {
        setallequip(res.data);
      } else {
        setallequip([]);
      }
    }
  };

  const show2 = async () => {
    const result = await fetch("https://lab-management-system-n3i5.onrender.com/api/getlab", {
      method: "get",
    });
    if (result) {
      const res = await result.json();
      if (res.statuscode === 1) {
        setalllabs(res.data);
      } else {
        setalllabs([]);
      }
    }
  };

  const show3 = async () => {
    const result = await fetch("https://lab-management-system-n3i5.onrender.com/api/returndata", {
      method: "get",
    });
    if (result) {
      const res = await result.json();
      if (res.statuscode === 1) {
        setallreturndata(res.data);
      } else {
        console.error("Failed to load return data");
      }
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        await Promise.all([show(), show2(), show3()]);
      } catch (err) {
        setError(err?.message || "Unable to load dashboard data. Please check the server and try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalEquipment = equip.reduce((total, item) => total + Number(item.Quantity || 0), 0);
  const totalCapacity = labs.reduce((total, item) => total + Number(item.Capacity || 0), 0);

  const formatReturnDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <>
      <main className="dashboard-page" ref={dashboardRef}>
        <div className="container-fluid dashboard-shell">
          <div className="row g-4 align-items-start">
            <div className="col-12 col-lg-auto position-sticky " style={{top:"110px"}}>
              <Sidebar />
            </div>

            <section className="col">
              <div className="dashboard-header d-flex flex-md-row flex-column justify-content-between align-items-md-center gap-3">
                <div>
                  <p className="section-kicker mb-1">Lab Overview</p>
                  <h1>Dashboard</h1>
                  <p className="dashboard-subtitle">
                    Monitor equipment stock, lab capacity, and incharge details in one place.
                  </p>
                </div>

                <div className="dashboard-status align-self-start">
                  <span className="badge text-bg-light shadow-sm border px-3 py-2">
                    <span className="pulse-dot"></span> Realtime Sync
                  </span>
                  {error && <div className="alert alert-danger mt-3 mb-0 py-2 px-3 small">{error}</div>}
                </div>
              </div>

              {/* METRICS SUMMARY CARDS WITH GSAP COUNT-UP */}
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <div className="dashboard-metric">
                    <div className="metric-content">
                      <span className="metric-label">Total Labs</span>
                      <strong className="metric-value" id="metric-labs-val">
                        {labs.length}
                      </strong>
                    </div>
                    <div className="metric-icon-wrapper">
                      <i className="bi bi-houses"></i>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="dashboard-metric">
                    <div className="metric-content">
                      <span className="metric-label">Equipment Units</span>
                      <strong className="metric-value" id="metric-equip-val">
                        {totalEquipment}
                      </strong>
                    </div>
                    <div className="metric-icon-wrapper">
                      <i className="bi bi-tools"></i>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="dashboard-metric">
                    <div className="metric-content">
                      <span className="metric-label">Total Capacity</span>
                      <strong className="metric-value" id="metric-capacity-val">
                        {totalCapacity}
                      </strong>
                    </div>
                    <div className="metric-icon-wrapper">
                      <i className="bi bi-people"></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* VISUAL ANALYTICS & CHARTS SECTION */}
              <div className="row g-4 mt-1">
                <div className="col-12 col-xl-7">
                  <div className="chart-panel shadow-sm">
                    <div className="chart-panel-header">
                      <div>
                        <p className="section-kicker mb-1">Analytics</p>
                        <h2>Equipment Inventory Distribution</h2>
                      </div>
                      <span className="badge bg-indigo-subtle text-primary px-3 py-2 border">
                        <i className="bi bi-pie-chart-fill me-1"></i> Stock Shares
                      </span>
                    </div>

                    {loading ? (
                      <div className="dashboard-empty" style={{ minHeight: "240px" }}>
                        <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                        <span>Rendering stock charts...</span>
                      </div>
                    ) : equipmentPieData.length === 0 ? (
                      <div className="dashboard-empty" style={{ minHeight: "240px" }}>
                        <i className="bi bi-pie-chart mb-2"></i>
                        <span>No equipment available for visualization.</span>
                      </div>
                    ) : (
                      <div className="chart-wrapper" style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={equipmentPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={85}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {equipmentPieData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                                  stroke="rgba(255,255,255,0.6)"
                                  strokeWidth={2}
                                />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                              verticalAlign="bottom"
                              height={36}
                              formatter={(value) => <span style={{ color: "#475569", fontSize: "0.825rem", fontWeight: 600 }}>{value}</span>}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-12 col-xl-5">
                  <div className="chart-panel shadow-sm">
                    <div className="chart-panel-header">
                      <div>
                        <p className="section-kicker mb-1">Capacity</p>
                        <h2>Lab Room Capacity</h2>
                      </div>
                      <span className="badge bg-teal-subtle text-teal-emphasis px-3 py-2 border" style={{ backgroundColor: "#ccfbf1", color: "#0f766e" }}>
                        <i className="bi bi-bar-chart-line-fill me-1"></i> Student Load
                      </span>
                    </div>

                    {loading ? (
                      <div className="dashboard-empty" style={{ minHeight: "240px" }}>
                        <div className="spinner-border spinner-border-sm text-secondary mb-2" role="status"></div>
                        <span>Loading capacity charts...</span>
                      </div>
                    ) : labBarData.length === 0 ? (
                      <div className="dashboard-empty" style={{ minHeight: "240px" }}>
                        <i className="bi bi-bar-chart mb-2"></i>
                        <span>No lab capacity data available.</span>
                      </div>
                    ) : (
                      <div className="chart-wrapper" style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={labBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="capacity" fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={45} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* EQUIPMENT & LABS PANELS */}
              <div className="row g-4 mt-1">
                <div className="col-12 col-xl-7">
                  <div className="dashboard-panel shadow-sm">
                    <div className="dashboard-panel-header">
                      <div>
                        <p className="section-kicker mb-1">Inventory</p>
                        <h2>Equipment Stock</h2>
                      </div>
                      <span className="badge bg-primary-subtle text-primary-emphasis px-3 py-2">
                        {equip.length} items
                      </span>
                    </div>

                    {loading ? (
                      <div className="dashboard-empty">
                        <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                        <span>Loading inventory...</span>
                      </div>
                    ) : equip.length === 0 ? (
                      <div className="dashboard-empty">
                        <i className="bi bi-box-seam mb-2"></i>
                        <span>No equipment records found.</span>
                      </div>
                    ) : (
                      <div className="row g-3">
                        {equip.map((item, index) => (
                          <div className="col-12 col-sm-6" key={item._id || item.EquipmentName || index}>
                            <div className="equipment-card">
                              <div className="equipment-info">
                                <span className="equipment-name">
                                  <i className="bi bi-cpu text-primary me-2"></i>
                                  {item.EquipmentName}
                                </span>
                                <span className="equipment-label">Available quantity</span>
                              </div>
                              <span className="badge bg-light text-dark fs-6 px-3 py-2 border">
                                {item.Quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-12 col-xl-5">
                  <div className="dashboard-panel shadow-sm">
                    <div className="dashboard-panel-header">
                      <div>
                        <p className="section-kicker mb-1">Facilities</p>
                        <h2>Active Labs</h2>
                      </div>
                      <span className="badge bg-success-subtle text-success-emphasis px-3 py-2">
                        {labs.length} active
                      </span>
                    </div>

                    {loading ? (
                      <div className="dashboard-empty">
                        <div className="spinner-border spinner-border-sm text-success mb-2" role="status"></div>
                        <span>Loading labs...</span>
                      </div>
                    ) : labs.length === 0 ? (
                      <div className="dashboard-empty">
                        <i className="bi bi-door-closed mb-2"></i>
                        <span>No lab records found.</span>
                      </div>
                    ) : (
                      <div className="lab-list">
                        {labs.map((lab, index) => (
                          <div className="lab-list-item" key={lab._id || lab.LabName || index}>
                            <div className="lab-item-main">
                              <div className="lab-icon-box">
                                <i className="bi bi-pc-display"></i>
                              </div>
                              <div className="lab-details">
                                <div className="lab-title">{lab.LabName}</div>
                                <div className="lab-meta">
                                  <span>
                                    <i className="bi bi-person me-1"></i> {lab.LabIncharge}
                                  </span>
                                  <span>
                                    <i className="bi bi-people me-1"></i> {lab.Capacity} max
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RETURNED ITEMS SECTION */}
              <div className="row g-4 mt-1">
                <div className="col-12">
                  <div className="dashboard-panel returns-panel shadow-sm">
                    <div className="dashboard-panel-header">
                      <div>
                        <p className="section-kicker mb-1">Returns</p>
                        <h2>Returned Items</h2>
                      </div>
                      <span className="badge bg-warning-subtle text-warning-emphasis px-3 py-2">
                        {returndata.length} records
                      </span>
                    </div>

                    {loading ? (
                      <div className="dashboard-empty">
                        <div className="spinner-border spinner-border-sm text-warning mb-2" role="status"></div>
                        <span>Loading return requests...</span>
                      </div>
                    ) : returndata.length === 0 ? (
                      <div className="dashboard-empty">
                        <i className="bi bi-arrow-return-left mb-2"></i>
                        <span>No return records found.</span>
                      </div>
                    ) : (
                      <div className="returns-list">
                        {returndata.map((a) => (
                          <div className="return-item" key={a._id || a.Name}>
                            <div className="return-main">
                              <div className="return-icon-box">
                                <i className="bi bi-pc-display-horizontal text-secondary"></i>
                              </div>
                              <div className="return-details">
                                <div className="return-name">{a.Name}</div>
                                <div className="return-sub-details">
                                  <span className="return-lab">
                                    <i className="bi bi-door-open me-1"></i> {a.LabName}
                                  </span>
                                  {a.Issue && (
                                    <span className="return-issue">
                                      <i className="bi bi-exclamation-triangle me-1"></i> {a.Issue}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="return-meta">
                              <div className="return-date">
                                <i className="bi bi-calendar4-event me-1"></i> {formatReturnDate(a.Date)}
                              </div>
                              <div className={`return-status ${a.Status ? a.Status.toLowerCase() : "pending"}`}>
                                {a.Status || "Pending"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
};
