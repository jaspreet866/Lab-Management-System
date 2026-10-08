import { useContext, useEffect, useState, useRef, useMemo } from "react";
import { Sidebar } from "./sidebar";
import { Context } from "./context";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { API_BASE_URL } from "../config";
import { exportToCSV } from "../utils/exportUtils";
import { QRCodeModal } from "./QRCodeModal";
import { StatCardSkeleton, TableSkeleton, ChartSkeleton } from "./SkeletonLoaders";
import { useToast } from "./useToast";
import { useRequireRole } from "./useRequireRole";
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

const LOW_STOCK_LIMIT = 5;
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

// Fetches one list endpoint; throws when the request or the API reports a failure
const fetchList = async (path) => {
  const result = await fetch(`${API_BASE_URL}${path}`, { method: "get" });
  const res = await result.json();
  if (res.statuscode !== 1) throw new Error(`Request to ${path} failed`);
  return res.data || [];
};

// Keeps long lab names from running off the edge of the chart axis
const truncateLabel = (label) => (String(label).length > 16 ? `${String(label).slice(0, 15)}…` : label);

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const Dashboard = () => {
  const [equip, setallequip] = useState([]);
  const [labs, setalllabs] = useState([]);
  const [returndata, setallreturndata] = useState([]);
  const [allocations, setAllocations] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name_asc");

  const [selectedQRItem, setSelectedQRItem] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { usertype, openCmdPalette } = useContext(Context);
  const { success, warning } = useToast();
  const dashboardRef = useRef(null);

  const isAdmin = usertype === "Admin";

  // Authentication check: any signed-in account can view, admin tools are gated below
  useRequireRole(["Admin", "User"]);

  // Data fetching
  useEffect(() => {
    let cancelled = false;
    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      const [equipRes, labRes, returnRes, allocRes] = await Promise.allSettled([
        fetchList("/api/allequipments"),
        fetchList("/api/getlab"),
        fetchList("/api/returndata"),
        fetchList("/api/allocations"),
      ]);
      if (cancelled) return;

      if (equipRes.status === "fulfilled") setallequip(equipRes.value);
      if (labRes.status === "fulfilled") setalllabs(labRes.value);
      if (returnRes.status === "fulfilled") setallreturndata(returnRes.value);
      if (allocRes.status === "fulfilled") setAllocations(allocRes.value);

      const failed = [equipRes, labRes, returnRes, allocRes].filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        failed.forEach((r) => console.error("Dashboard load error:", r.reason));
        setError("Unable to load all dashboard records. Please check the backend connection.");
      }
      setLoading(false);
    };
    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filtered & Sorted Equipment List
  const filteredEquipment = useMemo(() => {
    return equip
      .filter((item) => {
        const nameMatch = (item.EquipmentName || "").toLowerCase().includes(searchTerm.toLowerCase());
        const qty = Number(item.Quantity || 0);

        if (statusFilter === "in_stock") return nameMatch && qty > LOW_STOCK_LIMIT;
        if (statusFilter === "low_stock") return nameMatch && qty <= LOW_STOCK_LIMIT;
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
    return equip.filter((item) => Number(item.Quantity || 0) <= LOW_STOCK_LIMIT);
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

  const totalEquipment = equip.reduce((total, item) => total + Number(item.Quantity || 0), 0);
  const totalCapacity = labs.reduce((total, item) => total + Number(item.Capacity || 0), 0);
  const labCount = labs.length;
  const returnCount = returndata.length;

  // GSAP Count-up animation
  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      const targets = [
        { id: "metric-labs-val", endVal: labCount },
        { id: "metric-equip-val", endVal: totalEquipment },
        { id: "metric-capacity-val", endVal: totalCapacity },
        { id: "metric-returns-val", endVal: returnCount },
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
              el.innerText = Math.round(counterObj.val).toLocaleString();
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
    }, dashboardRef);
    return () => ctx.revert();
  }, [loading, labCount, totalEquipment, totalCapacity, returnCount]);

  const openQRModal = (item) => {
    setSelectedQRItem(item);
    setIsQRModalOpen(true);
  };

  const exportDataset = (rows, prefix, label) => {
    const exported = exportToCSV(rows, `${prefix}_${new Date().toISOString().slice(0, 10)}.csv`);
    if (exported) success(`${label} exported to CSV`);
    else warning(`No ${label.toLowerCase()} available to export yet`);
  };

  const handleExportEquipment = () => exportDataset(equip, "Lab_Equipment_Inventory", "Equipment inventory");
  const handleExportReturns = () => exportDataset(returndata, "Lab_Return_Reports", "Return reports");
  const handleExportAllocations = () => exportDataset(allocations, "Lab_Allocations_Audit", "Allocations");

  return (
    <>
      <main className="dashboard-page" ref={dashboardRef}>
        <div className="container-fluid dashboard-shell px-3 px-md-4 py-3">
          <div className="row g-4 align-items-start">
            <div className="col-12 col-lg-auto app-sidebar-col">
              <Sidebar />
            </div>

            <div className="col">
              {/* TOP HERO HEADER */}
              <div className="dash-hero-header mb-4 p-4 rounded-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1">
                        <i className={`bi ${isAdmin ? "bi-shield-check" : "bi-person-check"} me-1`}></i> {isAdmin ? "Admin console" : "Staff workspace"}
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
                        {lowStockItems.length} equipment {lowStockItems.length === 1 ? "item is" : "items are"} running low in stock (≤ {LOW_STOCK_LIMIT} units).
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-warning text-dark fw-bold px-3 py-1.5 align-self-md-center"
                    onClick={() => {
                      setStatusFilter("low_stock");
                      document.getElementById("inventory-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
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
                            {labCount.toLocaleString()}
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
                            {totalEquipment.toLocaleString()}
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
                            {totalCapacity.toLocaleString()}
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
                            {returnCount.toLocaleString()}
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
                          <BarChart data={labBarData} margin={{ top: 10, right: 10, left: 0, bottom: 28 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 11, fill: "var(--text-muted)" }} 
                              axisLine={false} 
                              tickLine={false}
                              interval={0}
                              angle={-15}
                              textAnchor="end"
                              tickFormatter={truncateLabel}
                            />
                            <YAxis width={36} allowDecimals={false} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--primary-glow)" }} />
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
                      <div style={{ width: "100%", height: "300px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Tooltip content={<CustomTooltip />} />
                            <Pie
                              data={equipmentPieData}
                              cy="42%"
                              innerRadius={60}
                              outerRadius={85}
                              paddingAngle={3}
                              dataKey="value"
                              stroke="var(--bg-card)"
                              strokeWidth={2}
                            >
                              {equipmentPieData.map((entry, index) => (
                                <Cell key={`pie-cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Legend 
                              verticalAlign="bottom" 
                              iconType="circle"
                              iconSize={9}
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
              <div className="dash-section-card mb-4 p-4" id="inventory-section">
                <div className="d-flex flex-column flex-xxl-row justify-content-between align-items-xxl-center gap-3 mb-4">
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
                      <span className="input-group-text">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="search"
                        className="form-control"
                        placeholder="Search equipment..."
                        aria-label="Search equipment"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {/* Filter Pills */}
                    <div className="btn-group btn-group-sm" role="group" aria-label="Filter by stock status">
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
                      aria-label="Sort equipment"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="name_asc">Name (A-Z)</option>
                      <option value="name_desc">Name (Z-A)</option>
                      <option value="qty_desc">Highest Stock</option>
                      <option value="qty_asc">Lowest Stock</option>
                    </select>

                    {isAdmin && (
                      <Link to="/equipment" className="btn btn-sm btn-primary d-flex align-items-center gap-1.5">
                        <i className="bi bi-plus-lg"></i>
                        <span>Add</span>
                      </Link>
                    )}
                  </div>
                </div>

                {loading ? (
                  <TableSkeleton rows={4} />
                ) : filteredEquipment.length === 0 ? (
                  <div className="table-empty-state py-5 text-center">
                    <i className="bi bi-inboxes text-muted fs-1 mb-2 d-block"></i>
                    <h6 className="fw-bold mb-1">No equipment records match criteria</h6>
                    <p className="text-muted small mb-3">Try adjusting your search query or reset filter pills.</p>
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}>
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
                          let dotColor = "var(--success)";

                          if (qty === 0) {
                            statusClass = "badge-stock-out";
                            statusText = "Out of Stock";
                            dotColor = "var(--danger)";
                          } else if (qty <= LOW_STOCK_LIMIT) {
                            statusClass = "badge-stock-low";
                            statusText = "Low Stock";
                            dotColor = "var(--warning)";
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
                                  <span className="fw-bold item-qty-val">{qty.toLocaleString()}</span>
                                  <span className="text-muted small">units</span>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-action-icon"
                                    title="View QR Code Asset Tag"
                                    aria-label={`View QR code for ${item.EquipmentName}`}
                                    onClick={() => openQRModal(item)}
                                  >
                                    <i className="bi bi-qr-code-scan"></i>
                                  </button>
                                  {isAdmin && (
                                    <Link
                                      to="/allocate"
                                      className="btn btn-sm btn-action-icon"
                                      title="Issue Equipment"
                                      aria-label={`Issue ${item.EquipmentName}`}
                                    >
                                      <i className="bi bi-box-arrow-up-right"></i>
                                    </Link>
                                  )}
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

              {/* RECENT ALLOCATIONS */}
              <div className="dash-section-card mb-4 p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                  <div>
                    <h4 className="section-card-title mb-1">
                      <i className="bi bi-send-check me-2 text-purple"></i>
                      Recent Allocations
                    </h4>
                    <p className="text-muted small mb-0">Latest equipment issued from central stock to laboratories.</p>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleExportAllocations}>
                      <i className="bi bi-download me-1"></i> Export Allocations
                    </button>
                    {isAdmin && (
                      <Link to="/allocate" className="btn btn-sm btn-primary">
                        <i className="bi bi-plus-lg me-1"></i> Issue Stock
                      </Link>
                    )}
                  </div>
                </div>

                {loading ? (
                  <TableSkeleton rows={3} />
                ) : allocations.length === 0 ? (
                  <div className="table-empty-state py-4 text-center">
                    <i className="bi bi-box-arrow-up-right text-muted fs-2 mb-2 d-block"></i>
                    <p className="text-muted small mb-0">No equipment has been issued to a laboratory yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover lms-modern-table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Equipment</th>
                          <th>Destination Lab</th>
                          <th>Quantity</th>
                          <th>Issue Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allocations.slice(0, 5).map((item, idx) => (
                          <tr key={item._id || idx}>
                            <td>
                              <div className="d-flex align-items-center gap-2.5">
                                <span className="return-icon-badge">
                                  <i className="bi bi-cpu"></i>
                                </span>
                                <span className="fw-semibold">{item.Equipment || "Item"}</span>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                <i className="bi bi-door-closed me-1 text-muted"></i>
                                {item.Lab || "Lab"}
                              </span>
                            </td>
                            <td>
                              <span className="fw-bold item-qty-val">{Number(item.Quantity || 0).toLocaleString()}</span>
                              <span className="text-muted small ms-1">units</span>
                            </td>
                            <td className="text-muted small">
                              {formatDate(item.IssueDate || item.CreatedAt) || "Recent"}
                            </td>
                          </tr>
                        ))}
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
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={handleExportReturns}>
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
                              {formatDate(item.createdAt || item.date) || "Recent"}
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
