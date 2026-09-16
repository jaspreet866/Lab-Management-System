import { useContext, useEffect, useState, useRef, useMemo } from "react";
import { Sidebar } from "./sidebar";
import { Context } from "./context";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { API_BASE_URL } from "../config";
import { exportToCSV } from "../utils/exportUtils";
import { QRCodeModal } from "./QRCodeModal";
import { StatCardSkeleton, TableSkeleton, ChartSkeleton } from "./SkeletonLoaders";
import { useToast } from "./ToastContext";
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

const CHART_COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#ec4899", "#8b5cf6", "#3b82f6", "#10b981"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <div className="tooltip-title">{label || payload[0].name}</div>
        <div className="tooltip-value">
          <span className="tooltip-dot" style={{ backgroundColor: payload[0].fill || "#6366f1" }}></span>
          <span>{payload[0].value} {payload[0].dataKey === "capacity" ? "Capacity" : "Units"}</span>
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
  const [auditLogs, setAuditLogs] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [allocations, setAllocations] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name_asc");

  const [selectedQRItem, setSelectedQRItem] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { usertype, openCmdPalette } = useContext(Context);
  const { success, info } = useToast();
  const dashboardRef = useRef(null);

  // Authentication check
  useEffect(() => {
    if (usertype !== "Admin" && localStorage.getItem("Utype") !== "Admin") {
      navigate("/");
    }
  }, [usertype, navigate]);

  // Data fetching
  const show = async () => {
    try {
      const result = await fetch(`${API_BASE_URL}/api/allequipments`, { method: "get" });
      if (result) {
        const res = await result.json();
        if (res.statuscode === 1) setallequip(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load equipments:", err);
    }
  };

  const show2 = async () => {
    try {
      const result = await fetch(`${API_BASE_URL}/api/getlab`, { method: "get" });
      if (result) {
        const res = await result.json();
        if (res.statuscode === 1) setalllabs(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load labs:", err);
    }
  };

  const show3 = async () => {
    try {
      const result = await fetch(`${API_BASE_URL}/api/returndata`, { method: "get" });
      if (result) {
        const res = await result.json();
        if (res.statuscode === 1) setallreturndata(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load return data:", err);
    }
  };

  const fetchStatsAndLogs = async () => {
    try {
      const [statsRes, logsRes, allocRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/stats`).then((r) => r.json()).catch(() => null),
        fetch(`${API_BASE_URL}/api/auditlogs`).then((r) => r.json()).catch(() => null),
        fetch(`${API_BASE_URL}/api/allocations`).then((r) => r.json()).catch(() => null),
      ]);
      if (statsRes && statsRes.statuscode === 1) setStatsData(statsRes.data);
      if (logsRes && logsRes.statuscode === 1) setAuditLogs(logsRes.data || []);
      if (allocRes && allocRes.statuscode === 1) setAllocations(allocRes.data || []);
    } catch (err) {
      console.error("Failed to load extra dashboard data:", err);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        await Promise.all([show(), show2(), show3(), fetchStatsAndLogs()]);
      } catch (err) {
        setError("Unable to load all dashboard records. Please check the backend connection.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  // Filtered & Sorted Equipment List
  const filteredEquipment = useMemo(() => {
    return equip
      .filter((item) => {
        const nameMatch = (item.EquipmentName || "").toLowerCase().includes(searchTerm.toLowerCase());
        const qty = Number(item.Quantity || 0);

        if (statusFilter === "in_stock") return nameMatch && qty > 5;
        if (statusFilter === "low_stock") return nameMatch && qty > 0 && qty <= 5;
        if (statusFilter === "out_of_stock") return nameMatch && qty === 0;
        return nameMatch;
      })
      .sort((a, b) => {
        if (sortBy === "name_asc") return (a.EquipmentName || "").localeCompare(b.EquipmentName || "");
        if (sortBy === "name_desc") return (b.EquipmentName || "").localeCompare(a.EquipmentName || "");
        if (sortBy === "qty_desc") return Number(b.Quantity || 0) - Number(a.Quantity || 0);
        if (sortBy === "qty_asc") return Number(a.Quantity || 0) - Number(b.Quantity || 0);
        return 0;
      });
  }, [equip, searchTerm, statusFilter, sortBy]);

  // Low stock calculation
  const lowStockItems = useMemo(() => {
    return equip.filter((item) => Number(item.Quantity || 0) <= 5);
  }, [equip]);

  // Chart Data
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

  // GSAP Count-up animation
  useEffect(() => {
    if (!loading) {
      const totalEquip = equip.reduce((total, item) => total + Number(item.Quantity || 0), 0);
      const totalCap = labs.reduce((total, item) => total + Number(item.Capacity || 0), 0);

      const targets = [
        { id: "metric-labs-val", endVal: labs.length },
        { id: "metric-equip-val", endVal: totalEquip },
        { id: "metric-capacity-val", endVal: totalCap },
        { id: "metric-returns-val", endVal: returndata.length },
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

      // Stagger entrance of sections
      gsap.fromTo(".stat-card-premium", 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }
      );
      gsap.fromTo(".dash-section-card", 
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.15 }
      );
    }
  }, [loading, equip.length, labs.length, returndata.length]);

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

  const openQRModal = (item) => {
    setSelectedQRItem(item);
    setIsQRModalOpen(true);
  };

  const handleExportEquipment = () => {
    exportToCSV(equip, `Lab_Equipment_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    success("Equipment Inventory exported to CSV");
  };

  const handleExportReturns = () => {
    exportToCSV(returndata, `Lab_Return_Reports_${new Date().toISOString().slice(0, 10)}.csv`);
    success("Return Reports exported to CSV");
  };

  const handleExportAllocations = () => {
    exportToCSV(allocations, `Lab_Allocations_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    success("Allocations data exported to CSV");
  };

  return (
    <>
      <main className="dashboard-page" ref={dashboardRef}>
        <div className="container-fluid dashboard-shell px-3 px-md-4 py-3">
          <div className="row g-4 align-items-start">
            <div className="col-12 col-lg-auto position-sticky" style={{ top: "90px", zIndex: 10 }}>
              <Sidebar />
            </div>

            <div className="col">
              {/* TOP HERO HEADER */}
              <div className="dash-hero-header mb-4 p-4 rounded-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1">
                        <i className="bi bi-shield-check me-1"></i> ADMIN CONSOLE
                      </span>
                      <span className="text-muted small">Live Overview</span>
                    </div>
                    <h1 className="dash-hero-title mb-1">Lab Management Operations</h1>
                    <p className="dash-hero-subtitle text-muted mb-0">
                      Real-time inventory analytics, laboratory allocation telemetry, and maintenance records.
                    </p>
                  </div>

                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <button 
                      type="button" 
                      className="btn btn-outline-light-themed d-flex align-items-center gap-2"
                      onClick={openCmdPalette}
                    >
                      <i className="bi bi-terminal"></i>
                      <span>Command Bar</span>
                      <kbd className="small ms-1">⌘K</kbd>
                    </button>

                    <button 
                      type="button" 
                      className="btn btn-primary d-flex align-items-center gap-2"
                      onClick={handleExportEquipment}
                    >
                      <i className="bi bi-file-earmark-arrow-down"></i>
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-3 shadow-sm border-0 mb-4" role="alert">
                  <i className="bi bi-exclamation-octagon-fill fs-4 text-danger"></i>
                  <div>{error}</div>
                </div>
              )}

              {/* LOW STOCK ALERT BANNER */}
              {!loading && lowStockItems.length > 0 && (
                <div className="low-stock-alert mb-4 p-3 rounded-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="alert-icon-wrap bg-warning-subtle text-warning">
                      <i className="bi bi-exclamation-triangle-fill"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">Low Stock Warning</h6>
                      <p className="mb-0 small text-muted">
                        {lowStockItems.length} equipment {lowStockItems.length === 1 ? "item is" : "items are"} running low in stock (≤ 5 units).
                      </p>
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-warning text-dark fw-bold px-3 py-1.5 align-self-md-center"
                    onClick={() => setStatusFilter("low_stock")}
                  >
                    View Low Stock ({lowStockItems.length})
                  </button>
                </div>
              )}

              {/* STATS OVERVIEW CARDS */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-sm-6 col-xl-3">
                  {loading ? (
                    <StatCardSkeleton />
                  ) : (
                    <div className="stat-card-premium stat-card-indigo">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <span className="stat-label">Total Laboratories</span>
                          <h3 className="stat-number" id="metric-labs-val">
                            {labs.length}
                          </h3>
                          <span className="stat-badge text-indigo">
                            <i className="bi bi-arrow-up-short"></i> Active Facilities
                          </span>
                        </div>
                        <div className="stat-icon-chip bg-indigo-subtle text-indigo">
                          <i className="bi bi-building"></i>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                  {loading ? (
                    <StatCardSkeleton />
                  ) : (
                    <div className="stat-card-premium stat-card-teal">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <span className="stat-label">Equipment Stock</span>
                          <h3 className="stat-number" id="metric-equip-val">
                            {totalEquipment}
                          </h3>
                          <span className="stat-badge text-teal">
                            <i className="bi bi-box-seam me-1"></i> {equip.length} Unique Items
                          </span>
                        </div>
                        <div className="stat-icon-chip bg-teal-subtle text-teal">
                          <i className="bi bi-cpu"></i>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                  {loading ? (
                    <StatCardSkeleton />
                  ) : (
                    <div className="stat-card-premium stat-card-purple">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <span className="stat-label">Student Capacity</span>
                          <h3 className="stat-number" id="metric-capacity-val">
                            {totalCapacity}
                          </h3>
                          <span className="stat-badge text-purple">
                            <i className="bi bi-people me-1"></i> Total Workbenches
                          </span>
                        </div>
                        <div className="stat-icon-chip bg-purple-subtle text-purple">
                          <i className="bi bi-people-fill"></i>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-12 col-sm-6 col-xl-3">
                  {loading ? (
                    <StatCardSkeleton />
                  ) : (
                    <div className="stat-card-premium stat-card-amber">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <span className="stat-label">Reported Returns</span>
                          <h3 className="stat-number" id="metric-returns-val">
                            {returndata.length}
                          </h3>
                          <span className="stat-badge text-amber">
                            <i className="bi bi-clock-history me-1"></i> Maintenance Logs
                          </span>
                        </div>
                        <div className="stat-icon-chip bg-amber-subtle text-amber">
                          <i className="bi bi-arrow-return-left"></i>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CHARTS ROW */}
              <div className="row g-4 mb-4">
                <div className="col-12 col-xl-7">
                  <div className="dash-section-card h-100 p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h5 className="section-card-title mb-1">
                          <i className="bi bi-bar-chart-fill me-2 text-primary"></i>
                          Lab Student Capacity
                        </h5>
                        <p className="text-muted small mb-0">Maximum workstation capacity per registered laboratory.</p>
                      </div>
                      <span className="badge bg-light text-muted border">Bar Metric</span>
                    </div>

                    {loading ? (
                      <ChartSkeleton />
                    ) : labBarData.length === 0 ? (
                      <div className="chart-empty-state">
                        <i className="bi bi-building-exclamation fs-3 text-muted mb-2"></i>
                        <p className="text-muted small mb-0">No lab capacity records found</p>
                      </div>
                    ) : (
                      <div style={{ width: "100%", height: "260px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={labBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 11, fill: "var(--text-muted)" }} 
                              axisLine={false} 
                              tickLine={false}
                              interval={0}
                              angle={-15}
                              textAnchor="end"
                            />
                            <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="capacity" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={28}>
                              {labBarData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-12 col-xl-5">
                  <div className="dash-section-card h-100 p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h5 className="section-card-title mb-1">
                          <i className="bi bi-pie-chart-fill me-2 text-teal"></i>
                          Stock Distribution
                        </h5>
                        <p className="text-muted small mb-0">Inventory breakdown across top equipment types.</p>
                      </div>
                      <span className="badge bg-light text-muted border">Share</span>
                    </div>

                    {loading ? (
                      <ChartSkeleton />
                    ) : equipmentPieData.length === 0 ? (
                      <div className="chart-empty-state">
                        <i className="bi bi-box-seam fs-3 text-muted mb-2"></i>
                        <p className="text-muted small mb-0">No equipment distribution records</p>
                      </div>
                    ) : (
                      <div style={{ width: "100%", height: "260px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Tooltip content={<CustomTooltip />} />
                            <Pie
                              data={equipmentPieData}
                              innerRadius={60}
                              outerRadius={85}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {equipmentPieData.map((entry, index) => (
                                <Cell key={`pie-cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Legend 
                              verticalAlign="bottom" 
                              height={36} 
                              iconType="circle"
                              formatter={(value) => <span className="legend-text">{value}</span>}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* EQUIPMENT INVENTORY TABLE */}
              <div className="dash-section-card mb-4 p-4">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                  <div>
                    <h4 className="section-card-title mb-1">
                      <i className="bi bi-boxes me-2 text-primary"></i>
                      Equipment Stock Telemetry
                    </h4>
                    <p className="text-muted small mb-0">Real-time status of all laboratory instruments and parts.</p>
                  </div>

                  <div className="d-flex flex-wrap align-items-center gap-2">
                    {/* Search bar */}
                    <div className="input-group input-group-sm inventory-search-wrap">
                      <span className="input-group-text bg-transparent border-end-0 text-muted">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Search equipment..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {searchTerm && (
                        <button className="btn btn-sm btn-link text-muted" onClick={() => setSearchTerm("")}>
                          <i className="bi bi-x"></i>
                        </button>
                      )}
                    </div>

                    {/* Filter Pills */}
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        type="button"
                        className={`btn ${statusFilter === "all" ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setStatusFilter("all")}
                      >
                        All ({equip.length})
                      </button>
                      <button
                        type="button"
                        className={`btn ${statusFilter === "in_stock" ? "btn-success" : "btn-outline-secondary"}`}
                        onClick={() => setStatusFilter("in_stock")}
                      >
                        In Stock
                      </button>
                      <button
                        type="button"
                        className={`btn ${statusFilter === "low_stock" ? "btn-warning" : "btn-outline-secondary"}`}
                        onClick={() => setStatusFilter("low_stock")}
                      >
                        Low ({lowStockItems.length})
                      </button>
                    </div>

                    {/* Sort Dropdown */}
                    <select
                      className="form-select form-select-sm sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="name_asc">Name (A-Z)</option>
                      <option value="name_desc">Name (Z-A)</option>
                      <option value="qty_desc">Highest Stock</option>
                      <option value="qty_asc">Lowest Stock</option>
                    </select>

                    <Link to="/equipment" className="btn btn-sm btn-primary d-flex align-items-center gap-1.5">
                      <i className="bi bi-plus-lg"></i>
                      <span>Add</span>
                    </Link>
                  </div>
                </div>

                {loading ? (
                  <TableSkeleton rows={4} />
                ) : filteredEquipment.length === 0 ? (
                  <div className="table-empty-state py-5 text-center">
                    <i className="bi bi-inboxes text-muted fs-1 mb-2 d-block"></i>
                    <h6 className="fw-bold mb-1">No equipment records match criteria</h6>
                    <p className="text-muted small mb-3">Try adjusting your search query or reset filter pills.</p>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}>
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover lms-modern-table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Item Details</th>
                          <th>Status</th>
                          <th>Available Stock</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEquipment.map((item, idx) => {
                          const qty = Number(item.Quantity || 0);
                          let statusClass = "badge-stock-in";
                          let statusText = "In Stock";
                          let dotColor = "#10b981";

                          if (qty === 0) {
                            statusClass = "badge-stock-out";
                            statusText = "Out of Stock";
                            dotColor = "#ef4444";
                          } else if (qty <= 5) {
                            statusClass = "badge-stock-low";
                            statusText = "Low Stock";
                            dotColor = "#f59e0b";
                          }

                          return (
                            <tr key={item._id || idx}>
                              <td>
                                <div className="d-flex align-items-center gap-3">
                                  <div className="item-avatar-icon">
                                    <i className="bi bi-cpu"></i>
                                  </div>
                                  <div>
                                    <span className="fw-bold item-title d-block">{item.EquipmentName}</span>
                                    <span className="text-muted small item-id-badge">ID: {item._id ? item._id.slice(-6).toUpperCase() : `EQ-${idx+1}`}</span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className={`stock-status-pill ${statusClass}`}>
                                  <span className="status-dot-pulse" style={{ backgroundColor: dotColor }}></span>
                                  {statusText}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <span className="fw-bold item-qty-val">{qty}</span>
                                  <span className="text-muted small">units</span>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <button
                                    className="btn btn-sm btn-action-icon"
                                    title="View QR Code Asset Tag"
                                    onClick={() => openQRModal(item)}
                                  >
                                    <i className="bi bi-qr-code-scan"></i>
                                  </button>
                                  <Link
                                    to="/allocate"
                                    className="btn btn-sm btn-action-icon"
                                    title="Issue Equipment"
                                  >
                                    <i className="bi bi-box-arrow-up-right"></i>
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* RECENT RETURN & MAINTENANCE REPORTS */}
              <div className="dash-section-card mb-4 p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                  <div>
                    <h4 className="section-card-title mb-1">
                      <i className="bi bi-tools me-2 text-warning"></i>
                      Recent Return & Maintenance Reports
                    </h4>
                    <p className="text-muted small mb-0">Logs of returned equipment and reported hardware issues.</p>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={handleExportReturns}>
                      <i className="bi bi-download me-1"></i> Export Logs
                    </button>
                    <Link to="/return" className="btn btn-sm btn-primary">
                      <i className="bi bi-plus-lg me-1"></i> New Return
                    </Link>
                  </div>
                </div>

                {loading ? (
                  <TableSkeleton rows={3} />
                ) : returndata.length === 0 ? (
                  <div className="table-empty-state py-4 text-center">
                    <i className="bi bi-check-circle text-success fs-2 mb-2 d-block"></i>
                    <p className="text-muted small mb-0">No active maintenance issues or returns recorded.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover lms-modern-table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Equipment</th>
                          <th>Origin Lab</th>
                          <th>Reported Issue</th>
                          <th>Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {returndata.slice(0, 5).map((item, idx) => (
                          <tr key={item._id || idx}>
                            <td>
                              <div className="d-flex align-items-center gap-2.5">
                                <span className="return-icon-badge">
                                  <i className="bi bi-pc-display"></i>
                                </span>
                                <span className="fw-semibold">{item.name || item.EquipmentName || "Item"}</span>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                <i className="bi bi-door-closed me-1 text-muted"></i>
                                {item.labname || item.LabName || "Lab"}
                              </span>
                            </td>
                            <td>
                              <span className={`issue-tag ${
                                (item.issue || "").toLowerCase().includes("damage") 
                                  ? "issue-tag-danger" 
                                  : (item.issue || "").toLowerCase().includes("wire") || (item.issue || "").toLowerCase().includes("not working")
                                  ? "issue-tag-warning"
                                  : "issue-tag-info"
                              }`}>
                                <i className="bi bi-exclamation-circle me-1"></i>
                                {item.issue || "No details provided"}
                              </span>
                            </td>
                            <td className="text-muted small">
                              {formatReturnDate(item.createdAt || item.date) || "Recent"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* QR CODE MODAL */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        item={selectedQRItem}
      />
    </>
  );
};
