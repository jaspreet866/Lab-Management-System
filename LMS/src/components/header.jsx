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
        alert("cvdfv");
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      await show();
    };

    init();
  }, []);

 

  return (
    <>
      <nav className="navbar navbar-expand-lg p-3 shadow-sm sticky-top">
        <div className="container header-shell">
            <div className="d-flex align-items-center gap-3">
            <button
              className="navbar-toggler d-lg-none"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#mobileOffcanvas"
              aria-controls="mobileOffcanvas"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <Link to="/" className="navbar-brand container text-decoration-none">
              <span className="fw-bold" style={{ color: '#165b68' }}>LMS</span>
            </Link>
          </div>

          <div
            className="collapse navbar-collapse d-none d-lg-flex align-items-center"
            id="navbarSupportedContent"
          >
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 gap-lg-2">
              <li className="nav-item">
                <Link to="/" className="nav-link active fw-semibold">
                  Home
                </Link>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Return
                </a>
                <ul className="dropdown-menu">
                  {data.map((a) => (
                    <li key={a._id || a.LabName}>
                      <Link className="dropdown-item" to={`/labdash?id=${a._id}`}>{a.LabName}</Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/issue">Issue</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/addequipment">Add Equipment</Link>
              </li>
              <li className="nav-item">
                <button className="btn btn-sm logbtn rounded-pill text-white px-3" type="button">Logout</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};
