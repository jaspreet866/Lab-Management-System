
export const Header=()=>{



    return(
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

                        <a to="/" className="navbar-brand container">
                            LMS
                        </a>
                    </div>

                  

                    <div className="collapse navbar-collapse d-none d-lg-flex align-items-center" id="navbarSupportedContent">
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0 gap-lg-2">
                            <li className="nav-item">
                                <a to="/" className="nav-link active fw-semibold">
                                    Home
                                </a>
                            </li>
                            <li className="nav-item ">
                                <a className="nav-link">Return</a>
                            </li>
                            <li className="nav-item ">   
                                <a className="nav-link">Issue</a>
                            </li>
                            <li className="nav-item">
                              <a className="nav-link">Add Equipment</a>
                            </li>
                            <li className="nav-item">
                               {/* {
                                id ? <button className="nav-link active">Logout</button>:<Link className="text-decoration-none" to="/login"> <button className=" nav-link active">Login</button></Link>
                               } */}
                            </li>

                        </ul>
                    </div>
                </div>
            </nav>

        </>
    )
}