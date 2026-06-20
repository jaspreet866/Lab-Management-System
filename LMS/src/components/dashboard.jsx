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
  const navigate=useNavigate()


const{usertype}=useContext(Context)






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
        // keep previous behaviour minimal
        alert("fgfg");
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

  return (
    <>
    {usertype === "Admin" ? <main className="dashboard-page">
      <div className="container-fluid dashboard-shell">
        <div className="row g-4 align-items-start">
          <div className="col-12 col-lg-auto">
            <Sidebar />
          </div>

          <section className="col">
            <div className="dashboard-header shadow-sm">
              <div>
                <p className="section-kicker mb-2">Lab Overview</p>
                <h1>Dashboard</h1>
                <p className="dashboard-subtitle">
                  Monitor equipment stock, lab capacity, and incharge details in one place.
                </p>
              </div>

              <div className="dashboard-status">
                <span className="badge text-bg-light">Live Records</span>
                {error && <div className="alert alert-danger mt-4 mb-0">{error}</div>}
              </div>
            </div>

            

            <div className="row g-3 mt-1">
              <div className="col-12 col-md-4">
                <div className="dashboard-metric shadow-sm">
                  <span>Total Labs</span>
                  <strong>{labs.length}</strong>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="dashboard-metric shadow-sm">
                  <span>Equipment Units</span>
                  <strong>{totalEquipment}</strong>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="dashboard-metric shadow-sm">
                  <span>Total Capacity</span>
                  <strong>{totalCapacity}</strong>
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
                    <span className="badge bg-primary-subtle text-primary-emphasis">
                      {equip.length} items
                    </span>
                  </div>

                 
                    <div className="row g-3">
                      {equip.map((item, index) => (
                        <div className="col-12 col-sm-6" key={item._id || item.EquipmentName || index}>
                          <div className="equipment-card">
                            <div>
                              <p className="equipment-name">{item.EquipmentName}</p>
                              <span className="equipment-label">Available quantity</span>
                            </div>
                            <span className="badge rounded-pill text-bg-primary">
                              {item.Quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
              </div>

              <div className="col-12 col-xl-5">
                <div className="dashboard-panel shadow-sm">
                  <div className="dashboard-panel-header">
                    <div>
                      <p className="section-kicker mb-1">Labs</p>
                      <h2>Lab Details</h2>
                    </div>
                    <span className="badge bg-success-subtle text-success-emphasis">
                      {labs.length} labs
                    </span>
                  </div>

                  {loading ? (
                    <div className="dashboard-empty">Loading lab records...</div>
                  ) : labs.length === 0 ? (
                    <div className="dashboard-empty">No lab records found.</div>
                  ) : (
                    <div className="lab-list">
                      {labs.map((lab, index) => (
                        <div className="lab-list-item" key={lab._id || lab.LabName || index}>
                          <div>
                            <p className="lab-name">{lab.LabName}</p>
                            <span>{lab.LabIncharge}</span>
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
            <section className="container-fluid">
              <div className="row g-4 mt-1">
                <div className="col-12">
                  <div className="dashboard-panel returns-panel shadow-sm">
                    <div className="dashboard-panel-header">
                      <div>
                        <p className="section-kicker mb-1">Returns</p>
                        <h2>Returned Items</h2>
                      </div>
                      <span className="badge returns-count">
                        {returndata.length} records
                      </span>
                    </div>

                   
                      <div className="returns-list">
                        {returndata.map((a) => (
                          <div className="return-item" key={a._id || a.Name}>
                            <div className="return-main">
                              <div className="return-name">{a.Name}</div>
                              <div className="return-lab">{a.LabName}</div>
                              <div className="return-issue">{a.Issue}</div>
                            </div>
                            <div className="return-meta">
                              <div className="return-date">{a.Date}</div>
                              <div className={`return-status ${a.Status ? a.Status.toLowerCase() : ''}`}>
                                {a.Status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    
                  </div>
                </div>
              </div>
            </section>
            
          </section>
         
        </div>
      </div>
    </main>:navigate("/")}
    </>
  );
};
