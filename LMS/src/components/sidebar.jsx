import { Link } from "react-router-dom"

export const Sidebar=()=>{



    return(
        <>
        <aside className="lms-sidebar">
            <div className="sidebar-card shadow-sm">
                <div className="sidebar-header">
                    <p className="section-kicker mb-1">Workspace</p>
                    <h2 className="sidebar-title">Dashboard</h2>
                </div>

                <div className="mb-4">
                    <label className="form-label">Select Lab</label>
                    <select className="form-select sidebar-select" defaultValue="LAB 1">
                        <option>LAB 1</option>
                        <option>LAB 2</option>
                        <option>LAB 3</option>
                    </select>
                </div>

                <ul className="nav nav-pills flex-column gap-2">
                    <li className="nav-item">
                        <Link className="nav-link sidebar-link active" to="/side">Dashboard</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link sidebar-link" to="/equipment">Add Equipment</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link sidebar-link" to="/lab">Add Lab</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link sidebar-link" to="/allocate">Return</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link sidebar-link" to="/return">Allocate</Link>
                    </li>
                   
                   
                </ul>
            </div>
        </aside>
        
        </>
    )
}
