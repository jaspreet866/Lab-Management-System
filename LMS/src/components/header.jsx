import {  useEffect, useState } from "react";
import { Link } from "react-router-dom";


export const Header = () => {
  const [data, setdata] = useState([]);
  const show = async () => {
    const result = await fetch("http://localhost:9000/api/getlab", {
      method: "get",
    });
    if (result) {
      const res = await result.json();
      if (res.statuscode === 1) {
        setdata(res.data);
      } else {
        alert("Error loading labs");
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      await show();
    };

    init();
  }, []);

  const logout=()=>{
    localStorage.clear()
    alert("Successfully Logout")
  }
 

  return (
    <>
      <nav className="navbar navbar-expand-lg sticky-top">
        <div className="container-fluid header-shell px-md-4">
          <div className="d-flex align-items-center gap-3">
            <button
              className="navbar-toggler border-0 shadow-none d-lg-none"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <Link to="/" className="navbar-brand text-decoration-none">
              <i className="bi bi-cpu-fill"></i>
              <span>LabFlow</span>
            </Link>
          </div>

          <div
            className="collapse navbar-collapse align-items-center"
            id="navbarSupportedContent"
          >
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 gap-lg-2 align-items-center">
              <li className="nav-item">
                <Link to="/" className="nav-link active">
                  <i className="bi bi-house-door"></i>
                  <span>Home</span>
                </Link>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="bi bi-collection"></i>
                  <span>Lab Dashboards</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                  {data.map((a) => (
                    <li key={a._id || a.LabName}>
                      <Link className="dropdown-item" to={`/labdash?id=${a._id}`}>
                        <i className="bi bi-chevron-right me-1 small"></i> {a.LabName}
                      </Link>
                    </li>
                  ))}
                  {data.length === 0 && (
                    <li>
                      <span className="dropdown-item-text text-muted small">No labs available</span>
                    </li>
                  )}
                </ul>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/allocate">
                  <i className="bi bi-box-arrow-up"></i>
                  <span>Issue</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/equipment">
                  <i className="bi bi-plus-circle"></i>
                  <span>Add Equipment</span>
                </Link>
              </li>
              <li className="nav-item ms-lg-2">
                <button className="btn logbtn d-flex align-items-center gap-2" type="button" onClick={logout}>
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};
