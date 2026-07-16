import { Link, useLocation } from "react-router-dom"

export const Sidebar=()=>{
    const location = useLocation();
    const currentPath = location.pathname;

    return(
        <>
        <aside className="lms-sidebar shadow-sm">
            <div className="sidebar-card">
                <div className="sidebar-header">
                    <p className="section-kicker mb-1">Workspace</p>
                    <h2 className="sidebar-title">Menu</h2>
                </div>

                <ul className="nav nav-pills flex-column gap-2">
                    <li className="nav-item">
                        <Link 
                            className={`nav-link sidebar-link ${currentPath === "/dashboard" ? "active" : ""}`} 
                            to="/dashboard"
                        >
                            <i className="bi bi-grid-1x2"></i>
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link 
                            className={`nav-link sidebar-link ${currentPath === "/equipment" ? "active" : ""}`} 
                            to="/equipment"
                        >
                            <i className="bi bi-plus-square"></i>
                            <span>Add Equipment</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link 
                            className={`nav-link sidebar-link ${currentPath === "/lab" ? "active" : ""}`} 
                            to="/lab"
                        >
                            <i className="bi bi-house-gear"></i>
                            <span>Add Lab</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link 
                            className={`nav-link sidebar-link ${currentPath === "/allocate" ? "active" : ""}`} 
                            to="/allocate"
                        >
                            <i className="bi bi-box-arrow-up"></i>
                            <span>Allocate Stock</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link 
                            className={`nav-link sidebar-link ${currentPath === "/return" ? "active" : ""}`} 
                            to="/return"
                        >
                            <i className="bi bi-box-arrow-down"></i>
                            <span>Return Device</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </aside>
        
        </>
    )
}
