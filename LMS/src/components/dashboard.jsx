import { useContext, useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { Context } from "./context";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const [equip, setallequip] = useState([]);
  const [labs, setalllabs] = useState([]);
  const [returndata, setallreturndata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { usertype } = useContext(Context);

  useEffect(() => {
    if (usertype !== "Admin" && localStorage.getItem("Utype") !== "Admin") {
      navigate("/");
    }
  }, [usertype, navigate]);

  const show = async () => {
    const result = await fetch("http://localhost:9000/api/allequipments", {
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
    const result = await fetch("http://localhost:9000/api/getlab", {
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
    const result = await fetch("http://localhost:9000/api/returndata", {
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
      <main className="dashboard-page">
        <div className="container-fluid dashboard-shell">
          <div className="row g-4 align-items-start">
            <div className="col-12 col-lg-auto">
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
                  <span className="badge text-bg-light">
                    <i className="bi bi-activity me-1"></i> Live Records
                  </span>
                  {error && <div className="alert alert-danger mt-3 mb-0 py-2 px-3 small">{error}</div>}
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <div className="dashboard-metric">
                    <div className="metric-content">
                      <span className="metric-label">Total Labs</span>
                      <strong className="metric-value">{labs.length}</strong>
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
                      <strong className="metric-value">{totalEquipment}</strong>
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
                      <strong className="metric-value">{totalCapacity}</strong>
                    </div>
                    <div className="metric-icon-wrapper">
                      <i className="bi bi-people"></i>
                    </div>
                  </div>
                </div>
              </div>

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
                              <span className="badge rounded-pill text-bg-primary">
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
                        <p className="section-kicker mb-1">Labs</p>
                        <h2>Lab Details</h2>
                      </div>
                      <span className="badge bg-success-subtle text-success-emphasis px-3 py-2">
                        {labs.length} labs
                      </span>
                    </div>

                    {loading ? (
                      <div className="dashboard-empty">
                        <div className="spinner-border spinner-border-sm text-success mb-2" role="status"></div>
                        <span>Loading labs...</span>
                      </div>
                    ) : labs.length === 0 ? (
                      <div className="dashboard-empty">
                        <i className="bi bi-building mb-2"></i>
                        <span>No lab records found.</span>
                      </div>
                    ) : (
                      <div className="lab-list">
                        {labs.map((lab, index) => (
                          <div className="lab-list-item" key={lab._id || lab.LabName || index}>
                            <div className="lab-info">
                              <span className="lab-name">
                                <i className="bi bi-door-closed text-success me-2"></i>
                                {lab.LabName}
                              </span>
                              <span>Incharge: {lab.LabIncharge}</span>
                            </div>
                            <div className="lab-capacity">
                              <strong>{lab.Capacity}</strong>
                              <span>Capacity</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

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
                              <div className={`return-status ${a.Status ? a.Status.toLowerCase() : 'pending'}`}>
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
